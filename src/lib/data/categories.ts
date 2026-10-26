import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-keyboards",
    slug: "keyboards",
    name: "Keyboards",
    tagline: "Mechanical, optical & hall-effect",
    icon: "Keyboard",
    accent: "#27e6ff",
  },
  {
    id: "cat-mice",
    slug: "mice",
    name: "Mice",
    tagline: "Featherlight & ultra-precise",
    icon: "Mouse",
    accent: "#a855f7",
  },
  {
    id: "cat-headsets",
    slug: "headsets",
    name: "Headsets",
    tagline: "Immersive spatial audio",
    icon: "Headphones",
    accent: "#ff3d81",
  },
  {
    id: "cat-monitors",
    slug: "monitors",
    name: "Monitors",
    tagline: "High-refresh & OLED",
    icon: "Monitor",
    accent: "#37e39b",
  },
  {
    id: "cat-mousepads",
    slug: "mousepads",
    name: "Mousepads",
    tagline: "Control & speed surfaces",
    icon: "Square",
    accent: "#ffb547",
  },
  {
    id: "cat-controllers",
    slug: "controllers",
    name: "Controllers",
    tagline: "Pro-grade gamepads",
    icon: "Gamepad2",
    accent: "#27e6ff",
  },
  {
    id: "cat-microphones",
    slug: "microphones",
    name: "Microphones",
    tagline: "Studio-clear streaming",
    icon: "Mic",
    accent: "#a855f7",
  },
  {
    id: "cat-webcams",
    slug: "webcams",
    name: "Webcams",
    tagline: "Crisp 1080p & 4K",
    icon: "Webcam",
    accent: "#37e39b",
  },
  {
    id: "cat-chairs",
    slug: "chairs",
    name: "Chairs",
    tagline: "All-day ergonomics",
    icon: "Armchair",
    accent: "#ff3d81",
  },
];

export function categoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
