'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react'
import { ProductImagePlaceholder } from '@/components/product-image-placeholder'
import { canPurchaseProduct, getProductStockLabel } from '@/lib/product-stock'
import { addItem } from '@/services/woocommerce/cart.service'
import { getCategories, getProducts } from '@/services/woocommerce/product.service'
import type {
  ProductQuery,
  WooCommerceCategory,
  WooCommerceProduct,
} from '@/services/woocommerce/types'

const productsPerPage = 24

function formatProductPrice(product: WooCommerceProduct) {
  const { price, currency_code, currency_minor_unit } = product.prices
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency_code,
  }).format(Number(price) / 10 ** currency_minor_unit)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export default function CollectionsPage() {
  const [products, setProducts] = useState<WooCommerceProduct[]>([])
  const [categories, setCategories] = useState<WooCommerceCategory[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingProductId, setAddingProductId] = useState<number | null>(null)
  const [addedProductId, setAddedProductId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true
    getCategories()
      .then((result) => {
        if (current) setCategories(result)
      })
      .catch((requestError: unknown) => {
        if (current) setError(errorMessage(requestError))
      })
    return () => {
      current = false
    }
  }, [])

  useEffect(() => {
    let current = true
    const timer = window.setTimeout(() => {
      const query: ProductQuery = { page, per_page: productsPerPage }
      if (search.trim()) query.search = search.trim()
      if (category) query.category = category
      setLoading(true)
      setError('')
      getProducts(query)
        .then((result) => {
          if (!current) return
          setProducts((existing) =>
            page === 1 ? result : [...existing, ...result],
          )
          setHasMore(result.length === productsPerPage)
        })
        .catch((requestError: unknown) => {
          if (current) setError(errorMessage(requestError))
        })
        .finally(() => {
          if (current) setLoading(false)
        })
    }, search ? 250 : 0)

    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [category, page, search])

  function updateCategory(value: string) {
    if (value === category) return
    setProducts([])
    setPage(1)
    setCategory(value)
  }

  function updateSearch(value: string) {
    if (value === search) return
    setProducts([])
    setPage(1)
    setSearch(value)
  }

  async function addToBag(product: WooCommerceProduct) {
    if (!canPurchaseProduct(product) || product.has_options) return
    setAddingProductId(product.id)
    setAddedProductId(null)
    setError('')
    try {
      await addItem(product.id)
      setAddedProductId(product.id)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setAddingProductId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-[#26352d]">
      <header className="border-b border-[#26352d]/10 px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-[-0.06em] md:text-3xl">morrow</Link>
          <div className="flex items-center gap-5">
            <Link href="/account" className="text-xs font-semibold tracking-[0.1em] uppercase">Account</Link>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase">
              <ArrowLeft size={16} /> Back to home
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a56f55] uppercase">The full collection</p>
        <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-5xl tracking-[-0.06em] md:text-7xl">Shop all</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#26352d]/65">
              Browse every product in our store and find the essentials for your daily ritual.
            </p>
          </div>
          <label className="flex items-center gap-3 border-b border-[#26352d]/30 text-xs">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent py-3 outline-none placeholder:text-[#26352d]/50 md:w-64"
            />
          </label>
        </div>

        <div className="mt-10 flex flex-wrap gap-5 border-b border-[#26352d]/10 pb-5 text-xs">
          <button
            onClick={() => updateCategory('')}
            className={!category ? 'border-b border-[#26352d] pb-1' : 'text-[#26352d]/50'}
          >
            All products
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => updateCategory(String(item.id))}
              className={category === String(item.id) ? 'border-b border-[#26352d] pb-1' : 'text-[#26352d]/50'}
            >
              {item.name}
            </button>
          ))}
        </div>

        {error && <p role="alert" className="mt-6 text-sm text-red-800">{error}</p>}

        {products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product) => {
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
                      disabled={!canPurchaseProduct(product) || product.has_options || addingProductId === product.id}
                      onClick={() => void addToBag(product)}
                      className="absolute bottom-3 left-3 right-3 bg-[#26352d] py-3 text-[10px] font-semibold tracking-[0.14em] text-white uppercase disabled:cursor-not-allowed disabled:opacity-70 md:translate-y-14 md:transition md:group-hover:translate-y-0"
                    >
                      {!canPurchaseProduct(product)
                        ? 'Out of stock'
                        : product.has_options
                          ? 'Options required'
                          : addingProductId === product.id
                            ? 'Adding…'
                            : addedProductId === product.id
                              ? 'Added to bag'
                              : 'Add to bag'}
                    </button>
                  </div>
                  <div className="mt-3 flex justify-between gap-2 text-sm">
                    <div>
                      <h2>
                        <Link href={`/products/${product.id}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs text-[#26352d]/50">
                        {product.categories.map((item) => item.name).join(', ')}
                      </p>
                      <p className={`mt-1 text-[10px] ${canPurchaseProduct(product) ? 'text-[#557553]' : 'text-[#a56f55]'}`}>
                        {getProductStockLabel(product)}
                      </p>
                    </div>
                    <span>{formatProductPrice(product)}</span>
                  </div>
                </article>
              )
            })}
          </div>
        ) : !loading ? (
          <p className="py-16 text-center font-serif text-2xl">
            {error ? 'Products could not be loaded.' : 'No products found.'}
          </p>
        ) : null}

        {loading && (
          <p className="py-12 text-center font-serif text-2xl">
            {products.length ? 'Loading more products…' : 'Loading products…'}
          </p>
        )}
        {!loading && hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex items-center gap-3 border-b border-[#26352d] pb-2 text-xs font-semibold tracking-[0.14em] uppercase"
            >
              Load more products <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      <footer className="bg-[#dfe8dc] px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <span className="font-serif text-2xl">morrow</span>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase">
            <ShoppingBag size={16} /> Continue shopping
          </Link>
        </div>
      </footer>
    </main>
  )
}
