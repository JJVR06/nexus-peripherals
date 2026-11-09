import { describe, expect, it } from "vitest";
import {
  validateProduct,
  safeNext,
  validQuantity,
} from "../src/lib/validation";
import { products } from "../src/lib/data/products";

describe("input validation", () => {
  it("accepts the seed catalog", () => {
    for (const p of products) expect(() => validateProduct(p)).not.toThrow();
  });
  it("rejects fractional stock and non-finite price", () => {
    expect(() => validateProduct({ ...products[0], stock: 1.5 })).toThrow();
    expect(() =>
      validateProduct({ ...products[0], price: Infinity }),
    ).toThrow();
    expect(() =>
      validateProduct({ ...products[0], categorySlug: "" }),
    ).toThrow();
  });
  it("restricts redirects to internal paths", () => {
    expect(safeNext("/checkout")).toBe("/checkout");
    for (const v of [
      "//evil.test",
      "javascript:alert(1)",
      "/\\evil.test",
      "https://evil.test",
    ])
      expect(safeNext(v)).toBe("/account");
  });
  it("requires bounded positive integer cart quantities", () => {
    for (const n of [0, -1, NaN, Infinity, 1.1, 1001])
      expect(validQuantity(n)).toBe(false);
    expect(validQuantity(1)).toBe(true);
  });
});
