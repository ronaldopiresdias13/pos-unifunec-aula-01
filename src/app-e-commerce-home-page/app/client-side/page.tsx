"use client";

import useSWR from "swr";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import ProductSections from "@/components/product-sections";
import ProductSectionsSkeleton from "@/components/product-sections-skeleton";
import type { ProductsByCategory } from "@/lib/products";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientSidePage() {
  const { data, error, isLoading } = useSWR<ProductsByCategory>(
    "/api/products",
    fetcher,
  );

  return (
    <Container sx={{ py: 4 }}>
      {isLoading && <ProductSectionsSkeleton />}
      {error && <Alert severity="error">Failed to load products.</Alert>}
      {data && <ProductSections products={data} />}
    </Container>
  );
}
