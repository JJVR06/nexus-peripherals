import type { Category, Product } from "@/lib/types";
export const validQuantity = (n: number) =>
  Number.isInteger(n) && n >= 1 && n <= 1000;
export function safeNext(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return "/account";
  try {
    const decoded = decodeURIComponent(value.split(/[?#]/)[0]);
    if (decoded.startsWith("//") || decoded.includes("\\")) return "/account";
    const path = new URL(decoded, "https://nexus.invalid").pathname;
    if (
      path.startsWith("//") ||
      path.includes("\\") ||
      /^\/(login|register)\/?$/i.test(path)
    )
      return "/account";
    return value;
  } catch {
    return "/account";
  }
}
export function validateCategory(c: Omit<Category, "id">) {
  if (
    !c.name.trim() ||
    c.name.length > 100 ||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)
  )
    throw new Error("Enter a category name and a unique lowercase URL slug.");
}
export function validateProduct(p: Omit<Product, "id">) {
  if (
    !p.name.trim() ||
    !p.brand.trim() ||
    !p.categorySlug ||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)
  )
    throw new Error("Name, brand, category, and a valid slug are required.");
  if (
    !Number.isFinite(p.price) ||
    p.price <= 0 ||
    p.price > 10000000 ||
    Math.abs(p.price * 100 - Math.round(p.price * 100)) > 0.000001
  )
    throw new Error("Enter a valid price.");
  if (!Number.isInteger(p.stock) || p.stock < 0 || p.stock > 1000000)
    throw new Error("Stock must be a non-negative whole number.");
  if (
    !Number.isFinite(p.rating) ||
    p.rating < 0 ||
    p.rating > 5 ||
    !Number.isInteger(p.reviewCount) ||
    p.reviewCount < 0
  )
    throw new Error("Check the rating and review count.");
  if (
    p.compareAtPrice !== undefined &&
    (!Number.isFinite(p.compareAtPrice) || p.compareAtPrice <= p.price)
  )
    throw new Error("Compare-at price must exceed the sale price.");
  for (const image of p.images) {
    try {
      if (new URL(image).protocol !== "https:") throw new Error();
    } catch {
      throw new Error("Image URLs must use HTTPS.");
    }
  }
}
export function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    if (/schema cache|does not exist|Could not find the table/i.test(message))
      return "Database setup is pending. Run the migration and seed SQL from the deployment guide in Supabase SQL Editor.";
    if (/duplicate key/i.test(message))
      return "That entry already exists. Use a unique slug or edit the existing entry.";
    if (/foreign key/i.test(message))
      return "This category is used by products. Reassign those products before renaming its slug or deleting it.";
    if (/row.level security|permission denied/i.test(message))
      return "Your account does not have permission for this action. Sign in with the correct account.";
    return message;
  }
  return "Something went wrong. Please try again.";
}
