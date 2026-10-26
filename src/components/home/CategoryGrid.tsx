import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { CategoryIcon } from "@/components/CategoryIcon";

export function CategoryGrid() {
  return (
    <section className="container-nexus py-10">
      <h2 className="mb-5 font-display text-xl font-bold sm:text-2xl">
        Shop by category
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50"
          >
            <CategoryIcon
              name={c.icon}
              size={28}
              strokeWidth={1.5}
              className="text-muted transition-colors group-hover:text-primary"
            />
            <span className="text-xs font-medium leading-tight">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
