export function isMissingProductSurfaceColumnError(error: { message?: string; code?: string } | null | undefined) {
  return Boolean(error && (error.code === "PGRST204" || /product_surface/i.test(error.message ?? "")));
}

export function omitProductSurface<T extends { product_surface?: unknown }>(payload: T): Omit<T, "product_surface"> {
  const { product_surface: omittedProductSurface, ...rest } = payload;
  void omittedProductSurface;

  return rest;
}
