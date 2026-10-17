import ProductDetailClient from './product-detail-client'

type ProductAcfResponse = {
  id: number
  acf?: { test?: unknown } | unknown[] | null
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const wordpressUrl = process.env.WORDPRESS_URL?.replace(/\/$/, '')
  let testValue: string | undefined

  if (wordpressUrl) {
    try {
      const response = await fetch(
        `${wordpressUrl}/wp-json/wp/v2/product/${encodeURIComponent(id)}?_fields=id,acf`,
        { cache: 'no-store' },
      )
      if (response.ok) {
        const product = (await response.json()) as ProductAcfResponse
        if (
          product.acf &&
          !Array.isArray(product.acf) &&
          typeof product.acf.test === 'string' &&
          product.acf.test.trim().length > 0
        ) {
          testValue = product.acf.test
        }
      }
    } catch {
      // The product page can still render when the optional ACF request fails.
    }
  }

  return <ProductDetailClient id={id} testValue={testValue} />
}


