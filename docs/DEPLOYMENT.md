# Free presentation deployment: Supabase + Vercel

## 1. Database setup — required before the app works

Open your Supabase project → **SQL Editor** → **New query**.

1. Open `supabase/migrations/001_store.sql` from this repository, copy its **entire contents**, and run it. This creates tables, policies, auth triggers, and transactional functions. It is a one-time migration for a fresh project; do not rerun it over an existing installation.
2. In a second query, run the entire `supabase/seed.sql`. This inserts 9 sample categories and 36 products. Repeating the seed preserves existing products and stock; it does not reset the demo.
3. Check Table Editor for `categories`, `products`, `profiles`, `orders`, `order_events`, `reviews`, and `subscriptions`.

The application has no service-role dependency. Never disable RLS, make orders public, or expose a service-role key to solve an access error.

## 2. Authentication and administrator

For a one-day presentation using fictional data, you may turn off **Confirm email** under Authentication → Providers/Sign In → Email (dashboard labels may vary). This allows immediate demo registration without depending on outbound email delivery. Keep password login enabled and use passwords of at least 8 characters.

If you keep confirmation on, configure and test email delivery first. Supabase's built-in mail service has delivery/rate restrictions; a public presentation with arbitrary email addresses may require custom SMTP. Password resets always require functioning email delivery. Existing signed-in users can change passwords from their account page.

1. Start the app locally or deploy it, then register **your own administrator email** through `/register`.
2. In Supabase SQL Editor, replace the email below with that exact account email and run:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL';

select id, email, role from public.profiles
where email = 'YOUR_ADMIN_EMAIL';
```

3. Verify the query returns one admin profile. Sign out and sign back in; open `/admin`.
4. Register a separate customer account to demonstrate permissions. Old `admin@nexus.ph` / `admin123` credentials are not installed.

Profile roles are controlled by SQL administrator access, not registration metadata or editable browser storage.

## 3. Local environment

```powershell
Copy-Item .env.local.example .env.local
npm ci
npm run dev
```

Set these variables in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

The provided project URL/key have already been placed in the local ignored `.env.local` for this workspace. They are not committed. Restart the dev server after changing them.

## 4. GitHub and Vercel

1. Commit and push the implementation to your repository `JJVR06/nexus-peripherals` once reviewed. Creating the repository earlier did not publish these later changes automatically.
2. In Vercel, import that repository. If missing, configure the GitHub app's repository access.
3. Use the **Next.js** preset, repository root directory, `npm run build` build command, and default output directory. Select a currently supported Node.js LTS runtime, at least 22.
4. Add both environment variables above to **Production** (and Preview if needed).
5. Deploy. No paid domain is required; use the generated `.vercel.app` URL.
6. In Supabase → Authentication → URL Configuration:
   - Set **Site URL** to the production HTTPS URL.
   - Add `https://YOUR_DEPLOYMENT.vercel.app/account` and `https://YOUR_DEPLOYMENT.vercel.app/reset-password` to Redirect URLs.
   - For local testing, also add `http://localhost:3000/account` and `http://localhost:3000/reset-password`.
7. Redeploy when build-time `NEXT_PUBLIC_*` variables change.

Do not select paid services or real payment credentials for this presentation. Vercel Hobby is for personal/non-commercial use; review current free-tier limits before deployment.

## 5. Presentation checklist

- Confirm the Supabase project is active; free projects may pause after inactivity. Restore it well before presenting.
- Open the site on two devices. Both should see the same seeded catalog.
- Register/sign in as the customer. Add stock to the cart and place a demo order.
- Confirm the success page stays on `/order/...`, not `/cart`.
- On another device, sign in as administrator. Verify the order is visible and inventory decreased.
- Move pending → processing → shipped (supply a demo tracking reference) → delivered.
- Create a second order and cancel it while pending/processing; verify inventory returns exactly once.
- Try viewing the first customer's order as a different customer; it should be hidden.
- Add/edit a category and product; verify the catalog/navigation update after refresh.
- Test reviews and newsletter preference saving; no marketing or order emails are expected.
- Test password email/reset separately if you plan to demonstrate it.
- Use fictional addresses and phone numbers. Remove demonstration personal data after the event.

## Troubleshooting

- **Database setup is pending**: run both SQL files in order, in the same project as the environment URL.
- **Invalid API key / fetch failed**: verify URL/key and network; redeploy after setting environment variables.
- **Permission denied**: check authentication and the profile's database role. Keep RLS enabled.
- **Record changed**: close the product editor, refresh, and reopen. A purchase or review changed its version.
- **Category is used**: reassign products before deleting or changing that category's slug.
- **Email rate limit / no confirmation**: configure SMTP, or disable email confirmation specifically for the presentation and use fictional accounts. Reset links still require email delivery.
- **Empty catalog without errors**: run the seed SQL, not only the migration.
