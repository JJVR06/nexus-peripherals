import type { User } from "@/lib/types";

/**
 * Seed accounts for the local demo. Passwords are plaintext here ONLY because
 * there is no backend yet — this is replaced wholesale by Firebase Auth.
 */
export const seedUsers: User[] = [
  {
    id: "usr-admin",
    name: "Nexus Admin",
    email: "admin@nexus.ph",
    password: "admin123",
    role: "admin",
    createdAt: "2026-01-02T08:00:00.000Z",
  },
  {
    id: "usr-demo",
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    password: "password",
    role: "customer",
    createdAt: "2026-02-14T10:30:00.000Z",
  },
];
