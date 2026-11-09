import { mkdirSync, writeFileSync } from "node:fs";
import { products } from "../src/lib/data/products";
import { categories } from "../src/lib/data/categories";
const quote = (value: unknown) =>
  "'" + JSON.stringify(value).replace(/'/g, "''") + "'::jsonb";
const lines = [
  "-- Run AFTER migrations/001_store.sql in Supabase SQL Editor.",
  "-- Idempotent: existing records and changed stock are preserved.",
  "begin;",
];
for (const category of categories) {
  const { id, ...data } = category;
  lines.push(
    `insert into public.categories(id,data) values ('${id}',${quote(data)}) on conflict do nothing;`,
  );
}
for (const product of products) {
  const { id, ...data } = product;
  lines.push(
    `insert into public.products(id,data) values ('${id}',${quote(data)}) on conflict do nothing;`,
  );
}
lines.push("commit;");
mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/seed.sql", lines.join("\n") + "\n");
console.log(
  `Generated supabase/seed.sql: ${categories.length} categories, ${products.length} products. Run it in Supabase SQL Editor; this command does not connect to the cloud.`,
);
