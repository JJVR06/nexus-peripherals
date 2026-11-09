import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
describe("storefront copy and motion contract", () => {
  it("removes school/project labels from shared navigation", () => {
    for (const path of [
      "src/components/layout/Header.tsx",
      "src/components/layout/Footer.tsx",
    ]) {
      expect(readFileSync(path, "utf8")).not.toMatch(
        /School presentation|Presentation store|school project|for this presentation/i,
      );
    }
  });
  it("supports reduced motion for transitions and uses distinct drawer motion", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toContain("nexus-drawer-in");
    expect(css).toContain("nexus-drawer-out");
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*transition-duration/,
    );
  });
  it("provides a reusable accessible cart success state", () => {
    const source = readFileSync("src/components/AddToCartButton.tsx", "utf8");
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("Added to cart");
    expect(source).toContain("clearTimeout");
  });
});
