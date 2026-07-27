export const OPEN_PRODUCT_REVIEWS_EVENT = "synk-open-product-reviews";

export function openProductReviews(productId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(OPEN_PRODUCT_REVIEWS_EVENT, {
      detail: { productId },
    }),
  );
}
