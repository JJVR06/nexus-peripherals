# Nexus Peripherals — presentation storefront

A Next.js storefront backed by Supabase Auth and PostgreSQL. Catalog changes and orders are shared across devices. Payments and fulfillment are explicitly demonstrations, not real commerce.

## Quick start

1. Use Node.js 22 LTS or newer and run `npm ci`.
2. Copy `.env.local.example` to `.env.local` and set the Supabase URL and public publishable key.
3. Complete [the deployment guide](docs/DEPLOYMENT.md), including both SQL files and an administrator account.
4. Run `npm run dev` and open http://localhost:3000.

The application intentionally displays a setup error rather than silently falling back to browser-local catalog or accounts when the database is missing. Only the cart is stored in the browser. Old demo credentials are removed from active source.

## Commands

- `npm run dev`: local development.
- `npm test`: unit and real PostgreSQL-engine tests (PGlite), including RLS and transactional checkout.
- `npm run lint`: ESLint.
- `npm run build`: production build and TypeScript check.
- `npm run check`: tests, lint, and production build.
- `npm run seed`: generate `supabase/seed.sql` from the sample catalog. This does **not** connect to or modify a remote database.

## Implemented

- Supabase account registration, login, logout, profile display-name editing, password reset/update UI.
- Public shared catalog; database-enforced administrator CRUD; unique slugs and category references.
- Stock-aware cart and signed-in checkout. Server-authoritative prices, shipping, totals, stock locking, rollback, and per-user request deduplication.
- Owner/admin-only order details and history, status transition enforcement, shipment references, status timeline, and cancellation restocking.
- Optimistic product version checks to prevent stale edits overwriting purchases or review changes.
- Public submitted reviews with author-only edits and database-derived ratings.
- Account-bound newsletter preferences; informative support/privacy/demo terms pages.
- Clear configuration and operation error messages. Catalog refreshes every 30 seconds; order detail refreshes every 15 seconds and on window focus.

## Intentional limits

- Checkout requires an account; there is no insecure guest order lookup.
- COD and electronic payments are demonstrations. No money is collected, goods dispatched, or payment-provider integration enabled.
- Newsletter preferences are saved; marketing emails and order-confirmation emails are not sent. Supabase authentication emails depend on your provider configuration and limits.
- Sample product ratings are replaced by actual submitted-review aggregates after the first review.
- Deleting/renaming a category used by products is blocked. Reassign its products first.
- The free Supabase/Vercel services must be configured by the account owner. Cloud setup is not performed by possessing only the public key.
- External product images require internet access and fall back to placeholders. Google fonts are fetched during builds.

See [verification notes](docs/VERIFICATION.md) for the distinction between local tests and live deployment verification.
