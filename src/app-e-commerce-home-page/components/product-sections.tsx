import ProductSection from "./product-section";
import type { ProductsByCategory } from "@/lib/products";

export default function ProductSections({
  products,
}: {
  products: ProductsByCategory;
}) {
  return (
    <>
      <ProductSection title="Recommended for you" products={products.recommended} />
      <ProductSection title="New products" products={products.newProducts} />
    </>
  );
}
