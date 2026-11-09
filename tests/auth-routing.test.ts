import { describe, it, expect } from "vitest";
import { safeNext } from "../src/lib/validation";
import { authDestination } from "../src/lib/auth-routing";
describe("authentication navigation", () => {
  it("prevents auth-page redirect loops", () => {
    for (const p of [
      "/login",
      "/register?next=/login",
      "/%6cogin",
      "/login/",
      "/account/../login",
      "/./register",
      "/account/%2e%2e/login",
    ])
      expect(safeNext(p)).toBe("/account");
  });
  it("preserves valid return destinations", () => {
    expect(authDestination("customer", "/checkout")).toBe("/checkout");
    expect(authDestination("admin", "/admin/orders")).toBe("/admin/orders");
  });
  it("defaults administrators to the dashboard and customers to their account", () => {
    expect(authDestination("admin", null)).toBe("/admin");
    expect(authDestination("customer", null)).toBe("/account");
  });
});
