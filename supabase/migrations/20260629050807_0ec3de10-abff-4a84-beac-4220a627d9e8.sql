
-- =============== ENUMS ===============
create type user_role as enum ('customer', 'admin');
create type order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- =============== PROFILES ===============
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role default 'customer'::user_role not null,
  first_name text,
  last_name text,
  email text unique not null,
  created_at timestamptz default now() not null
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- Admin check (security definer to avoid recursive RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Users view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "Admins update all profiles" on public.profiles for update to authenticated using (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============== PRODUCTS ===============
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null default 'ChronoCraft Custom',
  base_price numeric(10,2) not null,
  description text,
  hero_image_url text,
  is_active boolean default true not null
);
grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Public read active products" on public.products for select using (is_active = true);
create policy "Admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== CATALOG: STRAPS ===============
create table public.straps (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price_modifier numeric(10,2) default 0 not null,
  image_url text,
  swatch_color text,
  display_order int default 0 not null,
  is_active boolean default true not null
);
grant select on public.straps to anon, authenticated;
grant all on public.straps to service_role;
alter table public.straps enable row level security;
create policy "Public read active straps" on public.straps for select using (is_active = true);
create policy "Admins manage straps" on public.straps for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== CATALOG: DIAL COLORS ===============
create table public.dial_colors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  hex_code text,
  price_modifier numeric(10,2) default 0 not null,
  image_url text,
  display_order int default 0 not null,
  is_active boolean default true not null
);
grant select on public.dial_colors to anon, authenticated;
grant all on public.dial_colors to service_role;
alter table public.dial_colors enable row level security;
create policy "Public read active dial colors" on public.dial_colors for select using (is_active = true);
create policy "Admins manage dial colors" on public.dial_colors for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== CATALOG: CASE FINISHES ===============
create table public.case_finishes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  hex_code text,
  price_modifier numeric(10,2) default 0 not null,
  image_url text,
  display_order int default 0 not null,
  is_active boolean default true not null
);
grant select on public.case_finishes to anon, authenticated;
grant all on public.case_finishes to service_role;
alter table public.case_finishes enable row level security;
create policy "Public read active case finishes" on public.case_finishes for select using (is_active = true);
create policy "Admins manage case finishes" on public.case_finishes for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== CATALOG: WATCH SIZES ===============
create table public.watch_sizes (
  id uuid default gen_random_uuid() primary key,
  size text not null,
  price_modifier numeric(10,2) default 0 not null,
  display_order int default 0 not null,
  is_active boolean default true not null
);
grant select on public.watch_sizes to anon, authenticated;
grant all on public.watch_sizes to service_role;
alter table public.watch_sizes enable row level security;
create policy "Public read active watch sizes" on public.watch_sizes for select using (is_active = true);
create policy "Admins manage watch sizes" on public.watch_sizes for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== CATALOG: WARRANTY OPTIONS ===============
create table public.warranty_options (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price_modifier numeric(10,2) default 0 not null,
  display_order int default 0 not null,
  is_active boolean default true not null
);
grant select on public.warranty_options to anon, authenticated;
grant all on public.warranty_options to service_role;
alter table public.warranty_options enable row level security;
create policy "Public read active warranties" on public.warranty_options for select using (is_active = true);
create policy "Admins manage warranties" on public.warranty_options for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== ORDERS ===============
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete set null,
  total_price numeric(10,2) not null,
  status order_status default 'pending' not null,
  shipping_address jsonb not null,
  customer_email text not null,
  customer_name text not null,
  stripe_payment_id text,
  created_at timestamptz default now() not null
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Users view own orders" on public.orders for select to authenticated using (auth.uid() = customer_id);
create policy "Users insert own orders" on public.orders for insert to authenticated with check (auth.uid() = customer_id);
create policy "Admins manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== ORDER CONFIGURATIONS ===============
create table public.order_configurations (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  strap_id uuid references public.straps(id),
  dial_color_id uuid references public.dial_colors(id),
  case_finish_id uuid references public.case_finishes(id),
  watch_size_id uuid references public.watch_sizes(id),
  warranty_id uuid references public.warranty_options(id),
  engraving_text text check (char_length(engraving_text) <= 25),
  gift_packaging boolean default false not null,
  snapshot_base_price numeric(10,2) not null,
  snapshot_total_modifiers numeric(10,2) not null
);
grant select, insert on public.order_configurations to authenticated;
grant all on public.order_configurations to service_role;
alter table public.order_configurations enable row level security;
create policy "Users view own order configs" on public.order_configurations for select to authenticated using (
  order_id in (select id from public.orders where customer_id = auth.uid())
);
create policy "Users insert own order configs" on public.order_configurations for insert to authenticated with check (
  order_id in (select id from public.orders where customer_id = auth.uid())
);
create policy "Admins manage order configs" on public.order_configurations for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== TESTIMONIALS ===============
create table public.testimonials (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  content text not null,
  image_url text,
  rating int check (rating between 1 and 5) not null,
  is_verified boolean default false not null,
  is_published boolean default false not null,
  created_at timestamptz default now() not null
);
grant select on public.testimonials to anon, authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "Public read published testimonials" on public.testimonials for select using (is_published = true);
create policy "Admins manage testimonials" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== FAQ ===============
create table public.faq (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  question text not null,
  answer text not null,
  display_order int default 0 not null,
  is_published boolean default true not null
);
grant select on public.faq to anon, authenticated;
grant all on public.faq to service_role;
alter table public.faq enable row level security;
create policy "Public read published FAQs" on public.faq for select using (is_published = true);
create policy "Admins manage FAQs" on public.faq for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== SETTINGS ===============
create table public.settings (
  key text primary key,
  value jsonb not null,
  description text
);
grant select on public.settings to anon, authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "Public read settings" on public.settings for select using (true);
create policy "Admins manage settings" on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============== SEED DATA ===============
insert into public.settings (key, value, description) values
  ('gift_packaging_price', '10.00'::jsonb, 'Price for premium gift packaging'),
  ('engraving_price', '0.00'::jsonb, 'Price for custom engraving');

insert into public.products (name, base_price, description, is_active) values
  ('ChronoCraft Custom', 1200.00, 'A handcrafted luxury timepiece, configured to your taste. Swiss movement, sapphire glass, surgical-grade stainless steel.', true);

insert into public.straps (name, price_modifier, swatch_color, display_order) values
  ('Italian Leather', 0, '#5C3A1E', 1),
  ('Brushed Steel', 80, '#9CA3AF', 2),
  ('Sport Silicone', -40, '#1F2937', 3),
  ('Milanese Mesh', 120, '#C0C0C0', 4);

insert into public.dial_colors (name, hex_code, price_modifier, display_order) values
  ('Obsidian Black', '#0B0B0C', 0, 1),
  ('Arctic White', '#F2EFE6', 0, 2),
  ('Cobalt Blue', '#1E3A8A', 40, 3),
  ('Forest Green', '#14532D', 40, 4);

insert into public.case_finishes (name, hex_code, price_modifier, display_order) values
  ('Brushed Silver', '#C0C0C0', 0, 1),
  ('Stealth Black', '#1A1A1C', 60, 2),
  ('18k Gold', '#D4AF37', 240, 3),
  ('Rose Gold', '#B76E79', 200, 4);

insert into public.watch_sizes (size, price_modifier, display_order) values
  ('40mm', 0, 1),
  ('42mm', 20, 2),
  ('44mm', 40, 3);

insert into public.warranty_options (name, price_modifier, display_order) values
  ('Standard (1 Year)', 0, 1),
  ('Extended (2 Years)', 60, 2),
  ('Lifetime (5 Years)', 180, 3);

insert into public.testimonials (customer_name, content, rating, is_verified, is_published) values
  ('Marcus Chen', 'The configurator made me feel like a real watch designer. The result is exactly what I envisioned — heirloom quality.', 5, true, true),
  ('Sofia Reyes', 'Engraved my late grandfather''s initials on the back. Brought me to tears. Craftsmanship is unreal.', 5, true, true),
  ('James Whitford', 'I''ve owned Rolex and Omega. This sits right beside them on the winder. Stunning value.', 5, true, true),
  ('Aiko Tanaka', 'Rose gold case + cobalt dial. Compliments daily. Shipping was faster than promised.', 5, true, true);

insert into public.faq (category, question, answer, display_order) values
  ('Shipping', 'How long does shipping take?', 'Each ChronoCraft is hand-assembled to order in 7–10 business days. Express worldwide shipping is included.', 1),
  ('Warranty', 'What does the warranty cover?', 'All movements, the case, and the crown. Standard covers 1 year; Extended covers 2; Lifetime covers 5 years with free annual servicing.', 2),
  ('Water Resistance', 'Can I swim with my watch?', 'Yes — rated to 10 ATM (100m). Suitable for swimming and snorkeling, not for diving or hot showers.', 3),
  ('Returns', 'What is your return policy?', '30-day returns on unworn pieces. Engraved watches are final sale; we''ll repair or replace any defect free of charge.', 4),
  ('Engraving', 'How many characters can I engrave?', 'Up to 25 characters including spaces and a small set of emoji. Engraving is currently complimentary.', 5);
