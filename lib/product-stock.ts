import type { WooCommerceProduct } from "@/services/woocommerce/types";

export function canPurchaseProduct(product: WooCommerceProduct) {
  return product.is_in_stock && product.is_purchasable !== false;
}

export function getProductStockLabel(product: WooCommerceProduct) {
  if (!canPurchaseProduct(product)) return "Out of stock";
  if (product.is_on_backorder) return "Available on backorder";
  if (
    typeof product.low_stock_remaining === "number" &&
    product.low_stock_remaining > 0
  ) {
    return `Only ${product.low_stock_remaining} left`;
  }
  return "In stock";
}

export function getProductQuantityLimit(product: WooCommerceProduct) {
  return typeof product.quantity_limit === "number" &&
    Number.isFinite(product.quantity_limit) &&
    product.quantity_limit > 0
    ? product.quantity_limit
    : undefined;
}
