import { Suspense } from "react";
import { connection } from "next/server";
import Container from "@mui/material/Container";
import ProductSections from "@/components/product-sections";
import ProductSectionsSkeleton from "@/components/product-sections-skeleton";
import { getProducts } from "@/lib/products";

async function Products() {
  await connection();
  const products = await getProducts();
  return <ProductSections products={products} />;
}

export default function ServerSidePage() {
  return (
    <Container sx={{ py: 4 }}>
      <Suspense fallback={<ProductSectionsSkeleton />}>
        <Products />
      </Suspense>
    </Container>
  );
}
