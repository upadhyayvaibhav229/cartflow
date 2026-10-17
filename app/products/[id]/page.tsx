'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { ProductImagePlaceholder } from '@/components/product-image-placeholder'
import {
  canPurchaseProduct,
  getProductQuantityLimit,
  getProductStockLabel,
} from '@/lib/product-stock'
import { addItem } from '@/services/woocommerce/cart.service'
import { getProduct } from '@/services/woocommerce/product.service'
import type { WooCommerceProduct } from '@/services/woocommerce/types'

function formatPrice(product: WooCommerceProduct) {
  const { price, currency_code, currency_minor_unit } = product.prices
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency_code,
  }).format(Number(price) / 10 ** currency_minor_unit)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<WooCommerceProduct | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true
    setLoading(true)
    setProduct(null)
    setError('')
    getProduct(id)
      .then((result) => {
        if (current) setProduct(result)
      })
      .catch((requestError: unknown) => {
        if (current) setError(errorMessage(requestError))
      })
      .finally(() => {
        if (current) setLoading(false)
      })

    return () => {
      current = false
    }
  }, [id])

  async function addToBag() {
    if (!product || !canPurchaseProduct(product) || product.has_options) return
    setAdding(true)
    setAdded(false)
    setError('')
    try {
      await addItem(product.id, quantity)
      setAdded(true)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setAdding(false)
    }
  }

  const quantityLimit = product ? getProductQuantityLimit(product) : undefined

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-[#26352d]">
      <header className="border-b border-[#26352d]/10 px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-[-0.06em] md:text-3xl">morrow</Link>
          <div className="flex items-center gap-5">
            <Link href="/account" className="text-xs font-semibold tracking-[0.1em] uppercase">Account</Link>
            <Link href="/collections" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase">
              <ArrowLeft size={16} /> All products
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-16">
        {loading ? (
          <p className="py-24 text-center font-serif text-2xl">Loading product…</p>
        ) : error && !product ? (
          <div className="py-20 text-center">
            <p role="alert" className="text-sm text-red-800">{error}</p>
            <Link href="/collections" className="mt-6 inline-flex items-center gap-2 border-b border-[#26352d] pb-1 text-xs font-semibold uppercase">
              <ArrowLeft size={16} /> Back to all products
            </Link>
          </div>
        ) : product ? (
          <>
            <nav aria-label="Breadcrumb" className="mb-8 text-xs text-[#26352d]/55">
              <Link href="/">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/collections">Shop all</Link>
              {product.categories[0] && (
                <>
                  <span className="mx-2">/</span>
                  <span>{product.categories[0].name}</span>
                </>
              )}
            </nav>

            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div>
                {product.images.length ? (
                  <>
                    <img
                      src={product.images[selectedImage]?.src ?? product.images[0].src}
                      alt={product.images[selectedImage]?.alt || product.name}
                      className="aspect-[0.9] w-full bg-[#e5d8cb] object-cover"
                    />
                    {product.images.length > 1 && (
                      <div className="mt-4 grid grid-cols-5 gap-3">
                        {product.images.map((image, index) => (
                          <button
                            key={image.id}
                            aria-label={`View product image ${index + 1}`}
                            aria-pressed={selectedImage === index}
                            onClick={() => setSelectedImage(index)}
                            className={`overflow-hidden border ${selectedImage === index ? 'border-[#26352d]' : 'border-transparent'}`}
                          >
                            <img src={image.src} alt={image.alt || `${product.name} image ${index + 1}`} className="aspect-square w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <ProductImagePlaceholder productName={product.name} className="aspect-[0.9] w-full" />
                )}
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a56f55] uppercase">
                  {product.categories.map((category) => category.name).join(' · ') || 'The collection'}
                </p>
                <h1 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.05em] md:text-6xl">{product.name}</h1>
                <p className="mt-5 text-lg">{formatPrice(product)}</p>
                <p className={`mt-3 text-sm ${canPurchaseProduct(product) ? 'text-[#557553]' : 'text-[#a56f55]'}`}>
                  {getProductStockLabel(product)}
                </p>

                {product.short_description && (
                  <div
                    className="prose prose-sm mt-7 max-w-none text-[#26352d]/70"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {!product.has_options && (
                    <div className="flex h-12 items-center border border-[#26352d]/20">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1 || adding}
                        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                        className="h-full px-4 disabled:opacity-35"
                      >
                        −
                      </button>
                      <span aria-live="polite" className="min-w-8 text-center text-sm">{quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={adding || (quantityLimit !== undefined && quantity >= quantityLimit)}
                        onClick={() => setQuantity((value) => Math.min(
                          quantityLimit ?? Number.POSITIVE_INFINITY,
                          value + 1,
                        ))}
                        className="h-full px-4 disabled:opacity-35"
                      >
                        +
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={!canPurchaseProduct(product) || product.has_options || adding}
                    onClick={() => void addToBag()}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-3 bg-[#26352d] px-6 text-xs font-semibold tracking-[0.14em] text-white uppercase disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShoppingBag size={16} />
                    {!canPurchaseProduct(product)
                      ? 'Out of stock'
                      : product.has_options
                        ? 'Options required'
                        : adding
                          ? 'Adding…'
                          : added
                            ? 'Added to bag'
                            : 'Add to bag'}
                  </button>
                </div>

                {product.has_options && (
                  <p className="mt-3 text-xs text-[#26352d]/60">
                    This product has options. Please select a variation on the store before adding it to your bag.
                  </p>
                )}
                {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}

                {product.description && (
                  <section className="mt-10 border-t border-[#26352d]/15 pt-6">
                    <h2 className="font-serif text-2xl">About this product</h2>
                    <div
                      className="prose prose-sm mt-4 max-w-none text-[#26352d]/70"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </section>
                )}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  )
}
