import type { Category, Order, OrderStatus, Product } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";
import {
  validateCategory,
  validateProduct,
  errorMessage,
} from "@/lib/validation";
type Row = {
  version?: number;
  id: string;
  data: Record<string, unknown>;
  created_at?: string;
  user_id?: string;
  status?: OrderStatus;
};
function unwrap<T>(row: Row): T {
  return {
    ...row.data,
    id: row.id,
    ...(row.version !== undefined ? { version: row.version } : {}),
    ...(row.created_at ? { createdAt: row.created_at } : {}),
    ...(row.user_id ? { userId: row.user_id, status: row.status } : {}),
  } as T;
}
function check(error: unknown) {
  if (error) throw new Error(errorMessage(error));
}
async function list<T>(table: string): Promise<T[]> {
  const { data, error } = await getSupabase().from(table).select("*");
  check(error);
  return (data as Row[]).map(unwrap<T>);
}
async function save<T>(
  table: string,
  value: object,
  id?: string,
  version?: number,
): Promise<T> {
  let query = id
    ? getSupabase().from(table).update({ data: value }).eq("id", id)
    : getSupabase().from(table).insert({ data: value });
  if (id && version !== undefined) query = query.eq("version", version);
  const { data, error } = await query.select().single();
  if (error?.code === "PGRST116")
    throw new Error(
      "This record changed or was removed. Close the editor, refresh the page, and try again.",
    );
  check(error);
  return unwrap<T>(data as Row);
}
async function remove(table: string, id: string) {
  const { data, error } = await getSupabase()
    .from(table)
    .delete()
    .eq("id", id)
    .select("id");
  check(error);
  if (!data?.length) throw new Error("Entry not found or access denied.");
}
export const listProducts = () => list<Product>("products");
export const listCategories = () => list<Category>("categories");
export async function getProduct(slug: string) {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  check(error);
  return data ? unwrap<Product>(data) : undefined;
}
export async function getProductById(id: string) {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  check(error);
  return data ? unwrap<Product>(data) : undefined;
}
export async function createProduct(value: Omit<Product, "id">) {
  validateProduct(value);
  return save<Product>("products", value);
}
export async function updateProduct(
  id: string,
  value: Omit<Product, "id">,
  version: number,
) {
  validateProduct(value);
  return save<Product>("products", value, id, version);
}
export const deleteProduct = (id: string) => remove("products", id);
export async function createCategory(value: Omit<Category, "id">) {
  validateCategory(value);
  return save<Category>("categories", value);
}
export async function updateCategory(id: string, value: Omit<Category, "id">) {
  validateCategory(value);
  return save<Category>("categories", value, id);
}
export const deleteCategory = (id: string) => remove("categories", id);
export async function listOrders() {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  check(error);
  return (data as Row[]).map(unwrap<Order>);
}
export async function listOrdersByUser(userId: string) {
  return (await listOrders()).filter((o) => o.userId === userId);
}
export async function getOrder(id: string) {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  check(error);
  return data ? unwrap<Order>(data) : undefined;
}
export async function createOrder(data: {
  items: { productId: string; quantity: number }[];
  customer: Order["customer"];
  paymentMethod: string;
  requestKey: string;
}): Promise<Order> {
  const { data: result, error } = await getSupabase().rpc("place_order", {
    p_items: data.items.map(({ productId, quantity }) => ({
      productId,
      quantity,
    })),
    p_customer: data.customer,
    p_payment: data.paymentMethod,
    p_request_key: data.requestKey,
  });
  check(error);
  return result as Order;
}
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  tracking?: string,
): Promise<Order> {
  const { data, error } = await getSupabase().rpc("change_order_status", {
    p_id: id,
    p_status: status,
    p_tracking: tracking ?? null,
  });
  check(error);
  return data as Order;
}
export async function listOrderEvents(
  id: string,
): Promise<{ status: string; created_at: string }[]> {
  const { data, error } = await getSupabase()
    .from("order_events")
    .select("status,created_at")
    .eq("order_id", id)
    .order("created_at");
  check(error);
  return data ?? [];
}
export async function subscribeNewsletter() {
  const {
    data: { user },
    error: authError,
  } = await getSupabase().auth.getUser();
  check(authError);
  if (!user) throw new Error("Sign in to save your newsletter preference.");
  const { error } = await getSupabase()
    .from("subscriptions")
    .insert({ user_id: user.id, email: user.email });
  if (error?.code !== "23505") check(error);
}
export type Review = {
  id: string;
  rating: number;
  body: string;
  created_at: string;
};
export async function listReviews(productId: string): Promise<Review[]> {
  const { data, error } = await getSupabase()
    .from("reviews")
    .select("id,rating,body,created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  check(error);
  return data ?? [];
}
export async function saveReview(
  productId: string,
  rating: number,
  body: string,
) {
  const {
    data: { user },
    error,
  } = await getSupabase().auth.getUser();
  check(error);
  if (!user) throw new Error("Sign in to review this product.");
  const { data: existing, error: readError } = await getSupabase()
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  check(readError);
  const result = existing
    ? await getSupabase()
        .from("reviews")
        .update({ rating, body: body.trim() })
        .eq("id", existing.id)
    : await getSupabase()
        .from("reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          body: body.trim(),
        });
  check(result.error);
}
