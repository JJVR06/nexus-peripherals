"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { heroImages } from "@/lib/data/images";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

const SLIDES: Slide[] = [
  {
    image: heroImages.battlestation,
    eyebrow: "New season drops",
    title: "Build your battle station",
    subtitle: "Pro-grade peripherals trusted by players who refuse to lose to their hardware.",
    cta: "Shop all gear",
    href: "/products",
  },
  {
    image: heroImages.monitor,
    eyebrow: "Up to 360Hz",
    title: "See every frame",
    subtitle: "High-refresh and OLED monitors with the response times competition demands.",
    cta: "Shop monitors",
    href: "/products?category=monitors",
  },
  {
    image: heroImages.desk,
    eyebrow: "Mechanical & hall-effect",
    title: "Keyboards that win rounds",
    subtitle: "Rapid-trigger switches, gasket mounts and enthusiast builds — ready to ship.",
    cta: "Shop keyboards",
    href: "/products?category=keyboards",
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    // Respect users who prefer reduced motion — don't auto-advance.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="container-nexus pt-6">
      <div className="relative h-[340px] overflow-hidden rounded-xl border border-border sm:h-[400px] lg:h-[460px]">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
            <div className="relative flex h-full max-w-xl flex-col justify-center p-6 sm:p-10 lg:p-14">
              <span className="chip w-fit border-primary/40 bg-primary/10 text-primary">
                {s.eyebrow}
              </span>
              <h1 className="mt-4 font-display text-3xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
                {s.title}
              </h1>
              <p className="mt-3 max-w-md text-sm text-muted sm:text-base">{s.subtitle}</p>
              <div className="mt-6">
                <Link href={s.href} className="btn btn-primary">
                  {s.cta} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* arrows */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-bg/70 backdrop-blur transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-bg/70 backdrop-blur transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronRight size={20} />
        </button>

        {/* dots */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-2 bg-fg/40 hover:bg-fg/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
