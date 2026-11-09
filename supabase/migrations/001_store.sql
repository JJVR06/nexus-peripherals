-- Run once in Supabase SQL Editor before seed.sql. No service-role browser key required.
begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,name,email) values(new.id,left(coalesce(new.raw_user_meta_data->>'name','Customer'),100),new.email);
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id,name,email) select id,left(coalesce(raw_user_meta_data->>'name','Customer'),100),email from auth.users on conflict(id) do nothing;
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
create table public.categories (
  id text primary key default gen_random_uuid()::text,
  data jsonb not null,
  slug text generated always as (data->>'slug') stored unique not null,
  constraint valid_category check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(data->>'name') between 1 and 100 and data ?& array['name','slug','tagline','icon','accent'])
);
create table public.products (
  id text primary key default gen_random_uuid()::text,
  data jsonb not null,
  slug text generated always as (data->>'slug') stored unique not null,
  category_slug text generated always as (data->>'categorySlug') stored not null references public.categories(slug) on delete restrict on update restrict,
  created_at timestamptz not null default now(),
  version bigint not null default 0,
  constraint valid_product check (
    data ?& array['name','brand','slug','categorySlug','price','stock','rating','reviewCount','tags','images','specs','swatch','description','shortDescription']
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and length(data->>'name') between 1 and 200 and length(data->>'brand') between 1 and 100
    and jsonb_typeof(data->'price')='number' and (data->>'price')::numeric > 0 and (data->>'price')::numeric <= 10000000 and (data->>'price')::numeric*100=trunc((data->>'price')::numeric*100)
    and jsonb_typeof(data->'stock')='number' and (data->>'stock')::numeric between 0 and 1000000 and (data->>'stock')::numeric=trunc((data->>'stock')::numeric)
    and jsonb_typeof(data->'rating')='number' and (data->>'rating')::numeric between 0 and 5 and jsonb_typeof(data->'reviewCount')='number' and (data->>'reviewCount')::numeric >= 0 and (data->>'reviewCount')::numeric=trunc((data->>'reviewCount')::numeric)
    and jsonb_typeof(data->'tags')='array' and jsonb_typeof(data->'images')='array'
    and jsonb_typeof(data->'specs')='array' and jsonb_array_length(data->'swatch')=2
  )
);
create function public.bump_product_version() returns trigger language plpgsql set search_path = '' as $$
begin new.version := old.version+1; return new; end; $$;
create trigger product_version before update on public.products for each row execute function public.bump_product_version();
create table public.orders (
  id text primary key default ('NX-' || gen_random_uuid()::text),
  user_id uuid not null references public.profiles(id),
  request_key uuid not null,
  status text not null default 'pending' check(status in ('pending','processing','shipped','delivered','cancelled')),
  data jsonb not null,
  created_at timestamptz not null default now(),
  unique(user_id,request_key)
);
create index orders_by_user on public.orders(user_id,created_at desc);
create table public.order_events (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  status text not null,
  actor_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  rating integer not null check(rating between 1 and 5),
  body text not null check(length(body) between 3 and 2000),
  created_at timestamptz not null default now(),
  unique(product_id,user_id)
);
-- Permissions are enforced in Postgres, not by the admin navigation UI.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reviews enable row level security;
revoke all on public.profiles,public.categories,public.products,public.orders,public.order_events,public.subscriptions,public.reviews from anon,authenticated;
grant select on public.categories,public.products,public.reviews to anon,authenticated;
grant insert,update,delete on public.categories,public.products to authenticated;
grant select on public.profiles,public.orders,public.order_events,public.subscriptions to authenticated;
grant update(name) on public.profiles to authenticated;
grant insert,delete on public.reviews to authenticated;
grant update(rating,body) on public.reviews to authenticated;
grant insert,delete on public.subscriptions to authenticated;
create policy profiles_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profile_edit_name on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy categories_read on public.categories for select to anon,authenticated using(true);
create policy categories_admin on public.categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy products_read on public.products for select to anon,authenticated using(true);
create policy products_admin on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy orders_read on public.orders for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy events_read on public.order_events for select to authenticated using(exists(select 1 from public.orders where id=order_id and (user_id=auth.uid() or public.is_admin())));
create policy subscriptions_read on public.subscriptions for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy subscriptions_insert on public.subscriptions for insert to authenticated with check(user_id=auth.uid() and email=(select p.email from public.profiles p where p.id=auth.uid()));
create policy subscriptions_delete on public.subscriptions for delete to authenticated using(user_id=auth.uid());
create policy reviews_read on public.reviews for select to anon,authenticated using(true);
create policy reviews_insert on public.reviews for insert to authenticated with check(user_id=auth.uid());
create policy reviews_update on public.reviews for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy reviews_delete on public.reviews for delete to authenticated using(user_id=auth.uid() or public.is_admin());

create function public.place_order(p_items jsonb,p_customer jsonb,p_payment text,p_request_key uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid(); existing public.orders; item jsonb; product public.products;
  quantity integer; subtotal numeric := 0; shipping numeric; result_items jsonb := '[]'; result public.orders; field text; clean_customer jsonb := '{}';
begin
  if uid is null then raise exception 'Sign in before placing an order.'; end if;
  if p_request_key is null then raise exception 'A request key is required.'; end if;
  -- Serializes same-user retries, including simultaneous identical submissions.
  perform pg_advisory_xact_lock(hashtext(uid::text),hashtext(p_request_key::text));
  select * into existing from public.orders where user_id=uid and request_key=p_request_key;
  if found then return existing.data || jsonb_build_object('id',existing.id,'userId',existing.user_id,'status',existing.status,'createdAt',existing.created_at); end if;
  if p_payment is null or p_payment not in ('cod','demo') then raise exception 'Choose COD or a demo payment.'; end if;
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100 then raise exception 'Your cart must contain 1 to 100 products.'; end if;
  if p_customer is null or jsonb_typeof(p_customer)<>'object' then raise exception 'Shipping details are required.'; end if;
  foreach field in array array['name','email','phone','address','city','zip'] loop
    if jsonb_typeof(p_customer->field) is distinct from 'string' or coalesce(length(trim(p_customer->>field)),0) not between 1 and 300 then raise exception 'Check your shipping details: %',field; end if;
    clean_customer := clean_customer || jsonb_build_object(field,trim(p_customer->>field));
  end loop;
  if p_customer->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid email address.'; end if;
  if exists(select 1 from jsonb_array_elements(p_items) i group by i->>'productId' having count(*)>1) then raise exception 'Duplicate cart items.'; end if;
  -- A stable lock order prevents deadlocks between different carts.
  for item in select value from jsonb_array_elements(p_items) order by value->>'productId' loop
    if jsonb_typeof(item->'quantity') is distinct from 'number' or (item->>'quantity')::numeric not between 1 and 1000 or (item->>'quantity')::numeric<>trunc((item->>'quantity')::numeric) then raise exception 'Quantity must be a whole number from 1 to 1000.'; end if;
    quantity := (item->>'quantity')::integer;
    select * into product from public.products where id=item->>'productId' for update;
    if not found then raise exception 'A product in your cart is no longer available. Update your cart.'; end if;
    if (product.data->>'stock')::integer < quantity then raise exception 'Insufficient stock for %. Update your cart.', product.data->>'name'; end if;
    subtotal := subtotal + round((product.data->>'price')::numeric,2)*quantity;
    result_items := result_items || jsonb_build_array(jsonb_build_object('productId',product.id,'name',product.data->>'name','brand',product.data->>'brand','price',round((product.data->>'price')::numeric,2),'quantity',quantity));
    update public.products set data=jsonb_set(data,'{stock}',to_jsonb((data->>'stock')::integer-quantity)) where id=product.id;
  end loop;
  shipping := case when subtotal>=5000 then 0 else 250 end;
  insert into public.orders(user_id,request_key,data) values(uid,p_request_key,jsonb_build_object('items',result_items,'subtotal',subtotal,'shipping',shipping,'total',subtotal+shipping,'customer',clean_customer,'paymentMethod',case when p_payment='cod' then 'Cash on Delivery' else 'Demo electronic payment — no charge' end,'paymentStatus',case when p_payment='cod' then 'due_on_delivery' else 'simulated' end,'trackingNumber','')) returning * into result;
  insert into public.order_events(order_id,status,actor_id) values(result.id,'pending',uid);
  return result.data || jsonb_build_object('id',result.id,'userId',uid,'status',result.status,'createdAt',result.created_at);
end; $$;

create function public.change_order_status(p_id text,p_status text,p_tracking text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare ord public.orders; item jsonb;
begin
  if not public.is_admin() then raise exception 'Administrator access required.'; end if;
  select * into ord from public.orders where id=p_id for update;
  if not found then raise exception 'Order not found.'; end if;
  if p_status is null or p_status not in ('pending','processing','shipped','delivered','cancelled') then raise exception 'Invalid order status.'; end if;
  if ord.status<>p_status then
    if not ((ord.status='pending' and p_status in ('processing','cancelled')) or (ord.status='processing' and p_status in ('shipped','cancelled')) or (ord.status='shipped' and p_status='delivered')) then raise exception 'Invalid status transition: % to %',ord.status,p_status; end if;
    if p_status='cancelled' then
      for item in select value from jsonb_array_elements(ord.data->'items') order by value->>'productId' loop
        update public.products set data=jsonb_set(data,'{stock}',to_jsonb((data->>'stock')::integer+(item->>'quantity')::integer)) where id=item->>'productId';
      end loop;
    end if;
    insert into public.order_events(order_id,status,actor_id) values(p_id,p_status,auth.uid());
  end if;
  if p_status='shipped' and length(trim(coalesce(p_tracking,ord.data->>'trackingNumber','')))=0 then raise exception 'Enter a tracking reference before shipping.'; end if;
  update public.orders set status=p_status,data=case when p_tracking is null then data else jsonb_set(data,'{trackingNumber}',to_jsonb(left(trim(p_tracking),120))) end where id=p_id returning * into ord;
  return ord.data || jsonb_build_object('id',ord.id,'userId',ord.user_id,'status',ord.status,'createdAt',ord.created_at);
end; $$;

create function public.update_review_rating() returns trigger language plpgsql security definer set search_path = '' as $$
declare pid text := coalesce(new.product_id,old.product_id); avg_rating numeric; review_count integer;
begin
  select round(avg(rating),1),count(*) into avg_rating,review_count from public.reviews where product_id=pid;
  update public.products set data=data || jsonb_build_object('rating',coalesce(avg_rating,0),'reviewCount',review_count) where id=pid;
  return null;
end; $$;
create trigger review_rating after insert or update or delete on public.reviews for each row execute function public.update_review_rating();
revoke execute on function public.handle_new_user(),public.bump_product_version(),public.update_review_rating(),public.is_admin(),public.place_order(jsonb,jsonb,text,uuid),public.change_order_status(text,text,text) from public,anon,authenticated;
grant execute on function public.is_admin(),public.place_order(jsonb,jsonb,text,uuid),public.change_order_status(text,text,text) to authenticated;
commit;
