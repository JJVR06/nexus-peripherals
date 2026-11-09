import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { getProduct } from "@/lib/repository";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => undefined);
  if (!product) return { title: "Product" };
  return {
    title: `${product.brand} ${product.name}`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  return <ProductDetailClient key={slug} slug={slug} />;
}
