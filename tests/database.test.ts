import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
let db: PGlite;
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const ADMIN = "33333333-3333-4333-8333-333333333333";
const customer = JSON.stringify({
  name: "Test Buyer",
  email: "buyer@example.com",
  phone: "09170000000",
  address: "Test street",
  city: "Manila",
  zip: "1000",
});
async function asUser(id: string) {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub','${id}',false); set role authenticated;`,
  );
}
async function order(qty = 1, key = crypto.randomUUID()) {
  return db.query<{ result: { id: string; total: number } }>(
    "select public.place_order($1::jsonb,$2::jsonb,$3,$4::uuid) as result",
    [
      JSON.stringify([{ productId: "test-product", quantity: qty, price: 1 }]),
      customer,
      "cod",
      key,
    ],
  );
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}'); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`,
  );
  await db.exec(readFileSync("supabase/migrations/001_store.sql", "utf8"));
  await db.exec(
    `insert into auth.users(id,email) values ('${A}','buyer@example.com'),('${B}','other@example.com'),('${ADMIN}','admin@example.com'); update public.profiles set role='admin' where id='${ADMIN}'; insert into public.categories(id,data) values ('test-category','{"slug":"keyboards","name":"Keyboards","tagline":"Test","icon":"Keyboard","accent":"#123456"}'); insert into public.products(id,data) values ('test-product','{"slug":"test-product","categorySlug":"keyboards","name":"Test","brand":"Test","price":1000,"stock":10,"rating":0,"reviewCount":0,"tags":[],"images":[],"specs":[],"swatch":["#123456","#654321"],"description":"Test","shortDescription":"Test"}');`,
  );
});
afterAll(async () => {
  await db?.close();
});
describe.sequential("database security and checkout", () => {
  it("allows anonymous catalog reads but rejects checkout", async () => {
    await db.exec(
      "reset role; select set_config('request.jwt.claim.sub','',false); set role anon;",
    );
    expect((await db.query("select * from public.products")).rows).toHaveLength(
      1,
    );
    await expect(order()).rejects.toThrow();
  });
  it("rejects customer catalog writes and role escalation", async () => {
    await asUser(A);
    await expect(
      db.exec("insert into public.categories(id,data) values ('bad','{}')"),
    ).rejects.toThrow();
    await expect(
      db.exec("update public.profiles set role='admin'"),
    ).rejects.toThrow();
    await expect(
      db.exec(
        "insert into public.orders(user_id,data) values (auth.uid(),'{}')",
      ),
    ).rejects.toThrow();
  });
  it("prices from the database, decrements stock, and deduplicates retry", async () => {
    await asUser(A);
    const key = crypto.randomUUID();
    const first = (await order(2, key)).rows[0].result;
    expect(first.total).toBe(2250);
    expect((await order(2, key)).rows[0].result.id).toBe(first.id);
    expect(
      (
        await db.query<{ stock: string }>(
          "select data->>'stock' as stock from public.products",
        )
      ).rows[0].stock,
    ).toBe("8");
    await asUser(B);
    expect((await db.query("select * from public.orders")).rows).toHaveLength(
      0,
    );
  });
  it("rejects overselling and invalid quantities without changing stock", async () => {
    await asUser(A);
    for (const qty of [9, 0, -1, 1.5])
      await expect(order(qty)).rejects.toThrow();
    expect(
      (
        await db.query<{ stock: string }>(
          "select data->>'stock' as stock from public.products",
        )
      ).rows[0].stock,
    ).toBe("8");
  });
  it("rolls back earlier line items when a later item fails", async () => {
    await asUser(A);
    await expect(
      db.query(
        "select public.place_order($1::jsonb,$2::jsonb,'cod',$3::uuid)",
        [
          JSON.stringify([
            { productId: "test-product", quantity: 1 },
            { productId: "zzz-missing", quantity: 1 },
          ]),
          customer,
          crypto.randomUUID(),
        ],
      ),
    ).rejects.toThrow();
    expect(
      (
        await db.query<{ stock: string }>(
          "select data->>'stock' as stock from public.products",
        )
      ).rows[0].stock,
    ).toBe("8");
  });
  it("enforces status rules and restocks cancellation once", async () => {
    await asUser(A);
    const id = (
      await db.query<{ id: string }>("select id from public.orders limit 1")
    ).rows[0].id;
    await expect(
      db.query("select public.change_order_status($1,'shipped',null)", [id]),
    ).rejects.toThrow();
    await asUser(ADMIN);
    await db.query("select public.change_order_status($1,'cancelled',null)", [
      id,
    ]);
    await db.query("select public.change_order_status($1,'cancelled',null)", [
      id,
    ]);
    expect(
      (
        await db.query<{ stock: string }>(
          "select data->>'stock' as stock from public.products",
        )
      ).rows[0].stock,
    ).toBe("10");
    await expect(
      db.query("select public.change_order_status($1,'processing',null)", [id]),
    ).rejects.toThrow();
  });
  it("rejects object shipping fields before they reach React", async () => {
    await asUser(A);
    await expect(
      db.query(
        "select public.place_order($1::jsonb,$2::jsonb,'cod',$3::uuid)",
        [
          JSON.stringify([{ productId: "test-product", quantity: 1 }]),
          JSON.stringify({ ...JSON.parse(customer), name: { bad: true } }),
          crypto.randomUUID(),
        ],
      ),
    ).rejects.toThrow();
  });
  it("bumps product versions on inventory changes to reject stale edits", async () => {
    await asUser(ADMIN);
    const before = (
      await db.query<{ version: number }>(
        "select version from public.products where id='test-product'",
      )
    ).rows[0].version;
    await asUser(A);
    await order(1);
    await asUser(ADMIN);
    const stale = await db.query(
      "update public.products set data=jsonb_set(data,'{stock}','10') where id='test-product' and version=$1 returning id",
      [before],
    );
    expect(stale.rows).toHaveLength(0);
  });
  it("requires tracking before shipping and records delivered history", async () => {
    await asUser(A);
    const id = (await order()).rows[0].result.id;
    await asUser(ADMIN);
    await db.query("select public.change_order_status($1,'processing',null)", [
      id,
    ]);
    await expect(
      db.query("select public.change_order_status($1,'shipped',null)", [id]),
    ).rejects.toThrow();
    await db.query(
      "select public.change_order_status($1,'shipped','DEMO-123')",
      [id],
    );
    await db.query("select public.change_order_status($1,'delivered',null)", [
      id,
    ]);
    await asUser(A);
    expect(
      (
        await db.query(
          "select status from public.order_events where order_id=$1",
          [id],
        )
      ).rows,
    ).toHaveLength(4);
  });
  it("protects review authors, recomputes ratings, and prevents moving a review", async () => {
    await asUser(A);
    await db.query(
      "insert into public.reviews(product_id,rating,body) values ('test-product',5,'Great keyboard')",
    );
    expect(
      (
        await db.query<{ rating: string }>(
          "select data->>'rating' as rating from public.products where id='test-product'",
        )
      ).rows[0].rating,
    ).toBe("5.0");
    await asUser(B);
    expect(
      (await db.query("update public.reviews set rating=1 returning id")).rows,
    ).toHaveLength(0);
    await asUser(A);
    await expect(
      db.exec("update public.reviews set product_id='other-product'"),
    ).rejects.toThrow();
  });
  it("allows only an account's own newsletter email", async () => {
    await asUser(A);
    await expect(
      db.exec(
        "insert into public.subscriptions(user_id,email) values (auth.uid(),'victim@example.com')",
      ),
    ).rejects.toThrow();
    await db.exec(
      "insert into public.subscriptions(user_id,email) values (auth.uid(),'buyer@example.com')",
    );
    await asUser(B);
    expect(
      (await db.query("select * from public.subscriptions")).rows,
    ).toHaveLength(0);
  });
  it("seeds the real catalog without overwriting existing inventory", async () => {
    await db.exec("reset role");
    const sql = readFileSync("supabase/seed.sql", "utf8");
    await db.exec(sql);
    await db.exec(sql);
    expect(
      (await db.query("select id from public.products")).rows.length,
    ).toBeGreaterThan(30);
  });
  it("protects referenced categories and unique product slugs", async () => {
    await asUser(ADMIN);
    await expect(
      db.exec("delete from public.categories where id='test-category'"),
    ).rejects.toThrow();
    await expect(
      db.exec(
        "insert into public.products(id,data) select 'duplicate',data from public.products limit 1",
      ),
    ).rejects.toThrow();
  });
});
