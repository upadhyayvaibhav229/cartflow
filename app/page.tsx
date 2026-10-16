'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { ProductImagePlaceholder } from '@/components/product-image-placeholder'
import { canPurchaseProduct, getProductStockLabel } from '@/lib/product-stock'
import { addItem, applyCoupon, getCart, removeCoupon, removeItem, updateItem } from '@/services/woocommerce/cart.service'
import { getCheckout, submitCheckout } from '@/services/woocommerce/checkout.service'
import { getCategories, getProducts } from '@/services/woocommerce/product.service'
import type {
  CheckoutPayload,
  ProductQuery,
  WooCommerceCart,
  WooCommerceCategory,
  WooCommerceCheckout,
  WooCommerceProduct,
} from '@/services/woocommerce/types'

type Panel = 'cart' | 'checkout' | 'confirmation'

const addressFields = [
  { name: 'first_name', label: 'First name', required: true },
  { name: 'last_name', label: 'Last name', required: true },
  { name: 'address_1', label: 'Street address', required: true },
  { name: 'address_2', label: 'Apartment, suite, etc.', required: false },
  { name: 'city', label: 'City', required: true },
  { name: 'state', label: 'State / province', required: true },
  { name: 'postcode', label: 'Postal code', required: true },
  { name: 'country', label: 'Country code (e.g. US)', required: true },
  { name: 'email', label: 'Email address', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
] as const

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function formatPrice(value: string | number | undefined, currency: string, minorUnit: number) {
  const numericValue = Number(value)
  if (value === undefined || value === '' || !Number.isFinite(numericValue)) {
    return 'Price unavailable'
  }
  const amount = numericValue / 10 ** (Number.isInteger(minorUnit) && minorUnit >= 0 ? minorUnit : 2)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount)
}

function productPrice(product: WooCommerceProduct) {
  return formatPrice(
    product.prices.price,
    product.prices.currency_code,
    product.prices.currency_minor_unit,
  )
}

export default function Page() {
  const [products, setProducts] = useState<WooCommerceProduct[]>([])
  const [categories, setCategories] = useState<WooCommerceCategory[]>([])
  const [cart, setCart] = useState<WooCommerceCart | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [productsLoading, setProductsLoading] = useState(true)
  const [cartBusy, setCartBusy] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [productError, setProductError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [cartError, setCartError] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [panel, setPanel] = useState<Panel | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [checkoutInfo, setCheckoutInfo] = useState<WooCommerceCheckout | null>(null)
  const [order, setOrder] = useState<{
    order_id?: number
    status?: string
    redirect_url?: string
  } | null>(null)
  const [couponCode, setCouponCode] = useState('')

  useEffect(() => {
    let current = true
    getCategories()
      .then((result) => {
        if (current) setCategories(result)
      })
      .catch((error: unknown) => {
        if (current) setCategoryError(messageFor(error))
      })
    return () => {
      current = false
    }
  }, [])

  useEffect(() => {
    let current = true
    const timer = window.setTimeout(() => {
      const query: ProductQuery = { per_page: 4 }
      if (search.trim()) query.search = search.trim()
      if (activeCategory) query.category = activeCategory
      setProductsLoading(true)
      setProductError('')
      getProducts(query)
        .then((result) => {
          if (current) setProducts(result)
        })
        .catch((error: unknown) => {
          if (current) setProductError(messageFor(error))
        })
        .finally(() => {
          if (current) setProductsLoading(false)
        })
    }, search ? 250 : 0)

    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [activeCategory, search])

  useEffect(() => {
    let current = true
    getCart()
      .then((result) => {
        if (current) setCart(result)
      })
      .catch((error: unknown) => {
        if (current) setCartError(messageFor(error))
      })
    return () => {
      current = false
    }
  }, [])

  async function mutateCart(action: () => Promise<WooCommerceCart>) {
    setCartBusy(true)
    setCartError('')
    try {
      setCart(await action())
      return true
    } catch (error) {
      setCartError(messageFor(error))
      return false
    } finally {
      setCartBusy(false)
    }
  }

  async function addToCart(product: WooCommerceProduct) {
    if (!canPurchaseProduct(product) || product.has_options) return
    if (await mutateCart(() => addItem(product.id))) setPanel('cart')
  }

  async function changeQuantity(key: string, quantity: number) {
    if (quantity < 1) {
      await mutateCart(() => removeItem(key))
      return
    }
    await mutateCart(() => updateItem(key, quantity))
  }

  async function applyCartCoupon() {
    const code = couponCode.trim()
    if (!code) return
    if (await mutateCart(() => applyCoupon(code))) setCouponCode('')
  }

  async function beginCheckout() {
    setPanel('checkout')
    setCheckoutError('')
    setCheckoutBusy(true)
    try {
      setCheckoutInfo(await getCheckout())
    } catch (error) {
      setCheckoutError(messageFor(error))
    } finally {
      setCheckoutBusy(false)
    }
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const billingAddress = addressFields.reduce<Record<string, string>>(
      (address, field) => {
        address[field.name] = String(form.get(field.name) ?? '')
        return address
      },
      {},
    )
    const paymentMethod = String(form.get('payment_method') ?? '')
    const payload: CheckoutPayload = {
      billing_address: billingAddress,
      shipping_address: { ...billingAddress },
      ...(paymentMethod ? { payment_method: paymentMethod } : {}),
      customer_note: String(form.get('customer_note') ?? ''),
    }

    setCheckoutBusy(true)
    setCheckoutError('')
    try {
      setOrder(await submitCheckout(payload))
      setPanel('confirmation')
    } catch (error) {
      setCheckoutError(messageFor(error))
    } finally {
      setCheckoutBusy(false)
    }
  }

  const cartCount = cart?.items_count ?? 0
  const cartCurrency = cart?.totals.currency_code ?? 'USD'
  const cartMinorUnit = cart?.totals.currency_minor_unit ?? 2

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-[#26352d]">
      <header className="relative z-20 border-b border-[#26352d]/10 bg-[#fbfaf6]/95 px-5 py-5 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-sm md:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
            <span>Menu</span>
          </button>
          <a href="#top" className="font-serif text-2xl tracking-[-0.06em] md:text-3xl">morrow</a>
          <nav className="hidden items-center gap-8 text-[12px] font-medium tracking-[0.08em] uppercase md:flex">
            <Link href="/collections">Shop</Link>
            <a href="#categories">Categories</a>
            <a href="#story">Our approach</a>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <button aria-label="Search products" onClick={() => document.getElementById('product-search')?.focus()}>
              <Search />
            </button>
            <button
              aria-label="Shopping bag"
              className="flex items-center gap-1"
              onClick={() => setPanel('cart')}
            >
              <ShoppingBag />
              <span className="text-xs">({cartCount})</span>
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mt-5 flex flex-col gap-5 border-t border-[#26352d]/10 pt-6 text-sm md:hidden">
            <Link href="/collections" onClick={() => setMenuOpen(false)}>Shop all</Link>
            <a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a>
            <a href="#story" onClick={() => setMenuOpen(false)}>Our approach</a>
          </nav>
        )}
      </header>

      <section id="top" className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-16 pt-10 md:grid-cols-[0.9fr_1.3fr] md:items-end md:px-10 md:pb-24 md:pt-16">
        <div className="max-w-xl pb-2">
          <p className="mb-8 text-[11px] font-semibold tracking-[0.2em] text-[#a56f55] uppercase">Skin, simplified</p>
          <h1 className="font-serif text-[clamp(3.5rem,7vw,7.5rem)] leading-[0.88] tracking-[-0.07em]">
            A softer<br /><em className="font-normal">kind of glow.</em>
          </h1>
          <p className="mt-8 max-w-sm text-sm leading-6 text-[#26352d]/65">
            Thoughtful skincare for your everyday ritual. Gentle formulas, honest ingredients, and nothing your skin doesn&apos;t need.
          </p>
          <a href="#shop" className="mt-8 inline-flex items-center gap-3 border-b border-[#26352d] pb-2 text-xs font-semibold tracking-[0.14em] uppercase">
            Shop the essentials <ArrowRight />
          </a>
        </div>
        <div className="relative overflow-hidden rounded-[2px] bg-[#e5d8cb]">
          {products[0]?.images[0] && (
            <img
              src={products[0].images[0].src}
              alt={products[0].images[0].alt || products[0].name}
              className="aspect-[1.18] w-full object-cover"
            />
          )}
          <div className="absolute bottom-5 left-5 rounded-full bg-[#fbfaf6]/85 px-4 py-2 text-[10px] tracking-[0.14em] uppercase backdrop-blur">
            {products[0]?.name ?? 'The everyday edit'}
          </div>
        </div>
      </section>

      <section id="shop" className="border-y border-[#26352d]/10 bg-[#f0eee6] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a56f55] uppercase">Made for daily use</p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] md:text-5xl">The essentials</h2>
            </div>
            <label className="flex items-center gap-3 border-b border-[#26352d]/30 text-xs">
              <Search size={16} />
              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                className="w-full bg-transparent py-2 outline-none placeholder:text-[#26352d]/50 md:w-56"
              />
            </label>
          </div>

          <div id="categories" className="mb-8 flex flex-wrap gap-5 text-xs">
            <button
              onClick={() => setActiveCategory('')}
              className={!activeCategory ? 'border-b border-[#26352d] pb-1' : 'text-[#26352d]/50'}
            >
              All products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(String(category.id))}
                className={activeCategory === String(category.id) ? 'border-b border-[#26352d] pb-1' : 'text-[#26352d]/50'}
              >
                {category.name}
              </button>
            ))}
          </div>

          {productError && <p role="alert" className="mb-6 text-sm text-red-800">{productError}</p>}
          {productsLoading ? (
            <p className="py-12 text-center font-serif text-2xl">Loading products…</p>
          ) : products.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-6">
              {products.slice(0, 4).map((product) => {
                const image = product.images[0]
                return (
                  <article key={product.id} className="group">
                    <div className="relative overflow-hidden bg-[#e5d8cb]">
                      <Link href={`/products/${product.id}`} aria-label={`View ${product.name}`}>
                        {image ? (
                          <img
                            src={image.src}
                            alt={image.alt || product.name}
                            className="aspect-[0.86] w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <ProductImagePlaceholder productName={product.name} className="aspect-[0.86] w-full" />
                        )}
                      </Link>
                      <button
                        disabled={!canPurchaseProduct(product) || product.has_options || cartBusy}
                        onClick={() => void addToCart(product)}
                        className="absolute bottom-3 left-3 right-3 bg-[#26352d] py-3 text-[10px] font-semibold tracking-[0.14em] text-white uppercase transition group-hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 md:translate-y-14"
                      >
                        {!canPurchaseProduct(product) ? 'Out of stock' : product.has_options ? 'Options required' : 'Add to bag'}
                      </button>
                    </div>
                    <div className="mt-3 flex justify-between gap-2 text-sm">
                      <div>
                        <h3>
                          <Link href={`/products/${product.id}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-[#26352d]/50">
                          {product.categories.map((category) => category.name).join(', ')}
                        </p>
                        <p className={`mt-1 text-[10px] ${canPurchaseProduct(product) ? 'text-[#557553]' : 'text-[#a56f55]'}`}>
                          {getProductStockLabel(product)}
                        </p>
                      </div>
                      <span>{productPrice(product)}</span>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="py-12 text-center font-serif text-2xl">
              {productError ? 'Products could not be loaded.' : 'No products found. Try another search.'}
            </p>
          )}
          <div className="mt-10 text-center">
            <Link
              href="/collections"
              className="inline-flex items-center gap-3 border-b border-[#26352d] pb-2 text-xs font-semibold tracking-[0.14em] uppercase"
            >
              View all products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <div className="mb-10">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a56f55] uppercase">Browse the collection</p>
          <h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] md:text-5xl">Shop by category</h2>
        </div>
        {categoryError && <p role="alert" className="mb-6 text-sm text-red-800">{categoryError}</p>}
        {categories.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {categories.slice(0, 3).map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(String(category.id))
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group relative overflow-hidden bg-[#e5d8cb] text-left"
              >
                {category.image?.src && (
                  <img
                    src={category.image.src}
                    alt={category.image.alt || category.name}
                    className="aspect-[0.8] w-full object-cover brightness-90 transition duration-500 group-hover:scale-105 group-hover:brightness-100"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-6 pt-20 text-white">
                  <div>
                    <h3 className="font-serif text-3xl">{category.name}</h3>
                    <p className="mt-1 text-xs text-white/75">{category.count} products</p>
                  </div>
                  <ArrowRight />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#26352d]/60">Categories will appear here when the store has products assigned to them.</p>
        )}
      </section>

      <section id="story" className="grid bg-[#dfe8dc] md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 md:px-20 md:py-24">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a56f55] uppercase">A clearer approach</p>
          <h2 className="mt-5 max-w-lg font-serif text-5xl leading-[0.95] tracking-[-0.06em] md:text-6xl">Less, but better for skin.</h2>
          <p className="mt-7 max-w-md text-sm leading-6 text-[#26352d]/70">
            We make effective essentials with calm, considered formulas. No unnecessary fragrance, no overcomplicated routines, just the good stuff your skin can feel.
          </p>
        </div>
        <div className="min-h-[400px] bg-[#e5d8cb]">
          {categories[0]?.image?.src && (
            <img src={categories[0].image.src} alt={categories[0].image.alt || categories[0].name} className="h-full min-h-[400px] w-full object-cover" />
          )}
        </div>
      </section>

      <footer className="bg-[#dfe8dc] px-5 py-12 text-[#26352d] md:px-10 md:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="font-serif text-3xl">morrow</div>
          <p className="mt-4 text-sm text-[#26352d]/60">A softer approach to everyday skincare.</p>
          <div className="mt-12 border-t border-[#26352d]/15 pt-5 text-[10px] tracking-[0.1em] text-[#26352d]/40 uppercase">© 2026 morrow skin studio</div>
        </div>
      </footer>

      {panel && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#26352d]/30"
          onClick={() => setPanel(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-[#fbfaf6] p-6 shadow-xl md:p-9"
          >
            <div className="flex items-center justify-between border-b border-[#26352d]/15 pb-5">
              <h2 id="cart-title" className="font-serif text-3xl">
                {panel === 'checkout' ? 'Checkout' : panel === 'confirmation' ? 'Order received' : 'Your bag'}
              </h2>
              <button aria-label="Close cart" onClick={() => setPanel(null)}><X /></button>
            </div>

            {cartError && <p role="alert" className="mt-5 text-sm text-red-800">{cartError}</p>}

            {panel === 'cart' && (
              <>
                {!cart ? (
                  <p className="py-12 text-sm text-[#26352d]/60">Loading your cart…</p>
                ) : cart.items.length ? (
                  <>
                    <ul className="divide-y divide-[#26352d]/10">
                      {cart.items.map((item) => (
                        <li key={item.key} className="flex gap-4 py-5">
                          {item.images[0] ? (
                            <img src={item.images[0].src} alt={item.images[0].alt || item.name} className="h-24 w-20 object-cover" />
                          ) : (
                            <ProductImagePlaceholder productName={item.name} className="h-24 w-20 shrink-0" />
                          )}
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex justify-between gap-3">
                              <h3 className="text-sm">{item.name}</h3>
                              <span className="text-sm">
                                {formatPrice(
                                  item.totals?.line_total ??
                                    item.prices.total ??
                                    Number(item.prices.price) * item.quantity,
                                  item.totals?.currency_code ?? item.prices.currency_code,
                                  item.prices.currency_minor_unit,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <button disabled={cartBusy} onClick={() => void changeQuantity(item.key, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                              <span>{item.quantity}</span>
                              <button disabled={cartBusy} onClick={() => void changeQuantity(item.key, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button>
                              <button disabled={cartBusy} onClick={() => void changeQuantity(item.key, 0)} className="ml-auto text-xs underline">Remove</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <form
                      className="flex gap-3 border-y border-[#26352d]/15 py-5"
                      onSubmit={(event) => {
                        event.preventDefault()
                        void applyCartCoupon()
                      }}
                    >
                      <input
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                        placeholder="Coupon code"
                        aria-label="Coupon code"
                        className="min-w-0 flex-1 border-b border-[#26352d]/30 bg-transparent py-2 text-sm outline-none"
                      />
                      <button type="submit" disabled={cartBusy || !couponCode.trim()} className="text-xs font-semibold uppercase disabled:opacity-50">Apply</button>
                    </form>
                    {cart.coupons.map((coupon) => (
                      <div key={coupon.code} className="flex justify-between py-2 text-sm">
                        <span>Coupon: {coupon.code}</span>
                        <button disabled={cartBusy} onClick={() => {
                          setCouponCode(coupon.code)
                          void mutateCart(() => removeCoupon(coupon.code))
                        }} className="underline">Remove</button>
                      </div>
                    ))}

                    <div className="mt-auto border-t border-[#26352d]/15 pt-5">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatPrice(cart.totals.total_items, cartCurrency, cartMinorUnit)}</span>
                      </div>
                      <div className="mt-3 flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatPrice(cart.totals.total_price, cartCurrency, cartMinorUnit)}</span>
                      </div>
                      <button
                        disabled={cartBusy}
                        onClick={() => void beginCheckout()}
                        className="mt-6 w-full bg-[#26352d] py-4 text-xs font-semibold tracking-[0.14em] text-white uppercase disabled:opacity-50"
                      >
                        Continue to checkout
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="py-12 text-sm text-[#26352d]/60">Your cart is empty.</p>
                )}
              </>
            )}

            {panel === 'checkout' && (
              checkoutBusy && !checkoutInfo ? (
                <p className="py-8 text-sm text-[#26352d]/60">Loading checkout…</p>
              ) : (
                <form className="flex flex-col gap-5 py-6" onSubmit={(event) => void placeOrder(event)}>
                  <p className="text-sm text-[#26352d]/65">Enter your billing and shipping details to place your order.</p>
                  {checkoutError && <p role="alert" className="text-sm text-red-800">{checkoutError}</p>}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    {addressFields.map((field) => (
                      <label key={field.name} className={`${field.name === 'address_1' || field.name === 'address_2' || field.name === 'email' ? 'col-span-2' : ''} flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase`}>
                        {field.label}
                        <input
                          name={field.name}
                          type={'type' in field ? field.type : 'text'}
                          required={field.required}
                          defaultValue={checkoutInfo?.billing_address?.[field.name] ?? ''}
                          autoComplete={field.name}
                          className="border-b border-[#26352d]/30 bg-transparent px-0 py-2 text-sm font-normal tracking-normal outline-none focus:border-[#26352d]"
                        />
                      </label>
                    ))}
                  </div>
                  {checkoutInfo?.payment_methods?.length ? (
                    <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
                      Payment method
                      <select name="payment_method" required className="border-b border-[#26352d]/30 bg-transparent py-3 text-sm font-normal tracking-normal">
                        {checkoutInfo.payment_methods.map((method) => (
                          <option key={method} value={method}>{method.replaceAll('_', ' ')}</option>
                        ))}
                      </select>
                    </label>
                  ) : checkoutInfo?.needs_payment === false ? (
                    <p className="text-sm">No payment is required for this order.</p>
                  ) : (
                    <p role="alert" className="text-sm text-red-800">No payment methods are available. Please check your store checkout settings.</p>
                  )}
                  <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
                    Order notes (optional)
                    <textarea name="customer_note" rows={3} className="border-b border-[#26352d]/30 bg-transparent py-2 text-sm font-normal tracking-normal outline-none" />
                  </label>
                  <button
                    type="submit"
                    disabled={checkoutBusy || (!checkoutInfo?.payment_methods?.length && checkoutInfo?.needs_payment !== false)}
                    className="mt-2 w-full bg-[#26352d] py-4 text-xs font-semibold tracking-[0.14em] text-white uppercase disabled:opacity-50"
                  >
                    {checkoutBusy ? 'Placing order…' : 'Place order'}
                  </button>
                </form>
              )
            )}

            {panel === 'confirmation' && order && (
              <div className="py-8">
                <p className="font-serif text-2xl">Thank you for your order.</p>
                {order.order_id && <p className="mt-3 text-sm">Order #{order.order_id}</p>}
                {order.status && <p className="mt-1 text-sm text-[#26352d]/60">Status: {order.status}</p>}
                {order.redirect_url ? (
                  <a href={order.redirect_url} className="mt-6 inline-flex items-center gap-2 border-b border-[#26352d] pb-1 text-xs font-semibold uppercase">
                    Continue to payment <ArrowRight size={16} />
                  </a>
                ) : (
                  <button onClick={() => setPanel(null)} className="mt-6 border-b border-[#26352d] pb-1 text-xs font-semibold uppercase">Continue shopping</button>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
