import { errorMessage } from "@/lib/validation";
export function reportError(error: unknown) {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("nexus:error", { detail: errorMessage(error) }),
    );
}
export function dataChanged() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("nexus:data"));
}
