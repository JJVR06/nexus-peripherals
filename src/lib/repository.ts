/**
 * ============================================================================
 *  DATA REPOSITORY — the single source of truth for all persistence.
 * ============================================================================
 *
 *  Every page talks to the app through this module and NEVER touches the
 *  storage mechanism directly. Today it is backed by the browser's
 *  localStorage (seeded from the static catalog), which means the whole app
 *  runs with zero backend.
 *
 *  To go live with Firebase later you only reimplement the functions below
 *  using Firestore (e.g. `getDocs(collection(db, "products"))`) and the rest
 *  of the UI keeps working unchanged. See `firebase.ts.example` / README.
 * ============================================================================
 */
import type {
  Category,
  Order,
  OrderStatus,
  Product,
  User,
} from "@/lib/types";
import { products as seedProducts } from "@/lib/data/products";
import { categories as seedCategories } from "@/lib/data/categories";
import { seedUsers } from "@/lib/data/users";
import { shortId } from "@/lib/utils";

/** Bump this to force a reseed of catalog data after editing the seeds. */
const SEED_VERSION = "v2";
const K = {
  products: `nexus.products.${SEED_VERSION}`,
  categories: `nexus.categories.${SEED_VERSION}`,
  orders: `nexus.orders.${SEED_VERSION}`,
  users: `nexus.users.${SEED_VERSION}`,
};

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, seed: T[]): T[] {
  if (!isBrowser()) return structuredClone(seed);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return structuredClone(seed);
    }
    return JSON.parse(raw) as T[];
  } catch {
    return structuredClone(seed);
  }
}

function write<T>(key: string, value: T[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/** Simulate a tiny network delay so loading states are exercised. */
const tick = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/* --------------------------------- Products -------------------------------- */

export async function listProducts(): Promise<Product[]> {
  return tick(read<Product>(K.products, seedProducts));
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = read<Product>(K.products, seedProducts);
  return tick(all.find((p) => p.slug === slug));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const all = read<Product>(K.products, seedProducts);
  return tick(all.find((p) => p.id === id));
}

export async function createProduct(
  data: Omit<Product, "id">,
): Promise<Product> {
  const all = read<Product>(K.products, seedProducts);
  const product: Product = { ...data, id: shortId("PRD-") };
  all.unshift(product);
  write(K.products, all);
  return tick(product);
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>,
): Promise<Product | undefined> {
  const all = read<Product>(K.products, seedProducts);
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return tick(undefined);
  all[idx] = { ...all[idx], ...patch, id };
  write(K.products, all);
  return tick(all[idx]);
}

export async function deleteProduct(id: string): Promise<void> {
  const all = read<Product>(K.products, seedProducts).filter((p) => p.id !== id);
  write(K.products, all);
  return tick(undefined);
}

/* ------------------------------- Categories -------------------------------- */

export async function listCategories(): Promise<Category[]> {
  return tick(read<Category>(K.categories, seedCategories));
}

export async function createCategory(
  data: Omit<Category, "id">,
): Promise<Category> {
  const all = read<Category>(K.categories, seedCategories);
  const category: Category = { ...data, id: shortId("CAT-") };
  all.push(category);
  write(K.categories, all);
  return tick(category);
}

export async function updateCategory(
  id: string,
  patch: Partial<Category>,
): Promise<Category | undefined> {
  const all = read<Category>(K.categories, seedCategories);
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return tick(undefined);
  all[idx] = { ...all[idx], ...patch, id };
  write(K.categories, all);
  return tick(all[idx]);
}

export async function deleteCategory(id: string): Promise<void> {
  const all = read<Category>(K.categories, seedCategories).filter(
    (c) => c.id !== id,
  );
  write(K.categories, all);
  return tick(undefined);
}

/* --------------------------------- Orders ---------------------------------- */

export async function listOrders(): Promise<Order[]> {
  const all = read<Order>(K.orders, []);
  return tick(
    [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function listOrdersByUser(userId: string): Promise<Order[]> {
  const all = await listOrders();
  return all.filter((o) => o.userId === userId);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const all = read<Order>(K.orders, []);
  return tick(all.find((o) => o.id === id));
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status"> & { status?: OrderStatus },
): Promise<Order> {
  const all = read<Order>(K.orders, []);
  const order: Order = {
    ...data,
    status: data.status ?? "pending",
    id: shortId("NX-"),
    createdAt: new Date().toISOString(),
  };
  all.push(order);
  write(K.orders, all);
  return tick(order);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | undefined> {
  const all = read<Order>(K.orders, []);
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return tick(undefined);
  all[idx] = { ...all[idx], status };
  write(K.orders, all);
  return tick(all[idx]);
}

/* ---------------------------------- Users ---------------------------------- */

export async function listUsers(): Promise<User[]> {
  return tick(read<User>(K.users, seedUsers));
}

export async function findUserByEmail(
  email: string,
): Promise<User | undefined> {
  const all = read<User>(K.users, seedUsers);
  return tick(
    all.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  );
}

export async function createUser(
  data: Omit<User, "id" | "createdAt" | "role"> & { role?: User["role"] },
): Promise<User> {
  const all = read<User>(K.users, seedUsers);
  const user: User = {
    ...data,
    role: data.role ?? "customer",
    id: shortId("USR-"),
    createdAt: new Date().toISOString(),
  };
  all.push(user);
  write(K.users, all);
  return tick(user);
}
