import { beforeEach, describe, it, expect } from "vitest";
const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memory.set(k, v);
    },
    removeItem: (k: string) => {
      memory.delete(k);
    },
  },
});
const { useCart, cartSubtotal, shippingFor } =
  await import("../src/store/cart");
import { products } from "../src/lib/data/products";
beforeEach(() => useCart.setState({ items: [], isOpen: false }));
describe("cart invariants", () => {
  it("rejects sold-out and malformed additions", () => {
    useCart.getState().add({ ...products[0], stock: 0 });
    useCart.getState().add(products[0], -1);
    expect(useCart.getState().items).toHaveLength(0);
  });
  it("caps combined additions at 1000", () => {
    useCart.getState().add({ ...products[0], stock: 5000 }, 999);
    useCart.getState().add({ ...products[0], stock: 5000 }, 10);
    expect(useCart.getState().items[0].quantity).toBe(1000);
  });
  it("reconciles prices, availability and removed products", () => {
    useCart.getState().add(products[0], 3);
    useCart.getState().reconcile([{ ...products[0], price: 120, stock: 2 }]);
    expect(useCart.getState().items[0]).toMatchObject({
      quantity: 2,
      price: 120,
    });
    expect(cartSubtotal(useCart.getState().items)).toBe(240);
    useCart.getState().reconcile([]);
    expect(useCart.getState().items).toHaveLength(0);
  });
  it("removes zero quantities and applies shipping threshold", () => {
    useCart.getState().add(products[0]);
    useCart.getState().setQty(products[0].id, 0);
    expect(useCart.getState().items).toHaveLength(0);
    expect(shippingFor(4999)).toBe(250);
    expect(shippingFor(5000)).toBe(0);
  });
});
