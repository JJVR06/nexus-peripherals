# Shared store implementation plan

Goal: replace browser-local accounts/catalog/orders with Supabase, preserving the UI and using demo payments.

Architecture: Supabase Auth; public catalog with admin-only writes enforced by RLS; owner/admin-only orders. Transactional PostgreSQL functions validate checkout, lock inventory, calculate totals, deduplicate requests, and restore inventory on cancellation. No service-role key in the browser. Checkout requires sign-in to protect order retrieval.

- [x] Write failing tests for validation and database permission/order invariants.
- [x] Implement schema, policies, checkout/status RPCs, and idempotent catalog seed.
- [x] Replace repository and auth store; add setup/error states and account password recovery.
- [x] Repair cart/checkout, CRUD handling, category sources, tracking, and truthful demo messaging.
- [x] Verify tests, lint, production build, and browser flows. Document exact Supabase/Vercel setup and unverified remote dependencies.

Review focus: forged roles, other users’ orders, duplicate submissions, insufficient/deleted stock, transaction rollback and cancellation restock.

Cloud migration, live authentication email delivery, and deployment verification remain owner-dependent follow-up steps; see docs/DEPLOYMENT.md.
