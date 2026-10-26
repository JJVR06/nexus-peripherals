import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { productBySlug } from "@/lib/data/products";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
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
  return <ProductDetailClient slug={slug} />;
}
