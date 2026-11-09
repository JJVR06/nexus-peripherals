import type { Role } from "@/lib/types";
import { safeNext } from "@/lib/validation";
export function authDestination(role: Role, next: string | null) {
  return next ? safeNext(next) : role === "admin" ? "/admin" : "/account";
}
