import { getProducts } from "@/lib/products";

export async function GET() {
  const products = await getProducts();
  return Response.json(products);
}
