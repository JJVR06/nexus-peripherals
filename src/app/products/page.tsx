import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/CatalogClient";

export const metadata = {
  title: "Shop all products",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-nexus py-20 text-center text-muted">Loading catalog…</div>}>
      <CatalogClient />
    </Suspense>
  );
}
