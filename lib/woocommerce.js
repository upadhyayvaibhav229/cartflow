const WP_URL = process.env.WORDPRESS_URL;

export async function getProducts() {
  if (!WP_URL) {
    throw new Error("WORDPRESS_URL is missing");
  }

  const response = await fetch(
    `${WP_URL}/wp-json/wc/store/v1/products`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`WooCommerce API error: ${response.status}`);
  }

  return response.json();
}