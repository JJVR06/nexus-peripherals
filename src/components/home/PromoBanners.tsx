import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categoryImages } from "@/lib/data/images";

export function PromoBanners() {
  return (
    <section className="container-nexus grid gap-4 py-7 md:grid-cols-2">
      <PromoCard
        href="/products?category=keyboards"
        image={categoryImages.keyboards[1]}
        eyebrow="Mechanical & Hall-effect"
        title="Keyboards that win rounds"
      />
      <PromoCard
        href="/products?category=chairs"
        image={categoryImages.chairs[0]}
        eyebrow="All-day comfort"
        title="Sit like a champion"
      />
    </section>
  );
}

function PromoCard({
  href,
  image,
  eyebrow,
  title,
}: {
  href: string;
  image: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-48 flex-col justify-end overflow-hidden rounded-xl border border-border p-6"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-bg/10" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h3 className="mt-1 font-display text-2xl font-bold">{title}</h3>
        <span className="mt-2 flex items-center gap-1 text-sm font-semibold text-fg transition-all group-hover:gap-2">
          Shop now <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
