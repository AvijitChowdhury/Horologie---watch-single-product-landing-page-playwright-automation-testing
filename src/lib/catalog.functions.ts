import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type CatalogPayload = {
  product: {
    id: string;
    name: string;
    base_price: number;
    description: string | null;
  };
  straps: Array<{ id: string; name: string; price_modifier: number; swatch_color: string | null; image_url: string | null; display_order: number }>;
  dial_colors: Array<{ id: string; name: string; hex_code: string | null; price_modifier: number; display_order: number }>;
  case_finishes: Array<{ id: string; name: string; hex_code: string | null; price_modifier: number; display_order: number }>;
  watch_sizes: Array<{ id: string; size: string; price_modifier: number; display_order: number }>;
  warranty_options: Array<{ id: string; name: string; price_modifier: number; display_order: number }>;
  testimonials: Array<{ id: string; customer_name: string; content: string; rating: number; image_url: string | null }>;
  faq: Array<{ id: string; category: string; question: string; answer: string; display_order: number }>;
  settings: Record<string, string | number>;
};

export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<CatalogPayload> => {
  const sb = publicClient();
  const [product, straps, dials, finishes, sizes, warranties, testimonials, faq, settings] = await Promise.all([
    sb.from("products").select("id,name,base_price,description").eq("is_active", true).order("name").limit(1).maybeSingle(),
    sb.from("straps").select("id,name,price_modifier,swatch_color,image_url,display_order").eq("is_active", true).order("display_order"),
    sb.from("dial_colors").select("id,name,hex_code,price_modifier,display_order").eq("is_active", true).order("display_order"),
    sb.from("case_finishes").select("id,name,hex_code,price_modifier,display_order").eq("is_active", true).order("display_order"),
    sb.from("watch_sizes").select("id,size,price_modifier,display_order").eq("is_active", true).order("display_order"),
    sb.from("warranty_options").select("id,name,price_modifier,display_order").eq("is_active", true).order("display_order"),
    sb.from("testimonials").select("id,customer_name,content,rating,image_url").eq("is_published", true).order("created_at", { ascending: false }),
    sb.from("faq").select("id,category,question,answer,display_order").eq("is_published", true).order("display_order"),
    sb.from("settings").select("key,value"),
  ]);

  if (!product.data) throw new Error("No active product configured");

  const settingsMap: Record<string, string | number> = {};
  for (const row of settings.data ?? []) {
    const v = row.value as unknown;
    settingsMap[row.key] = typeof v === "number" ? v : Number(v) || String(v);
  }

  return {
    product: {
      id: product.data.id,
      name: product.data.name,
      base_price: Number(product.data.base_price),
      description: product.data.description,
    },
    straps: (straps.data ?? []).map((s) => ({ ...s, price_modifier: Number(s.price_modifier) })),
    dial_colors: (dials.data ?? []).map((s) => ({ ...s, price_modifier: Number(s.price_modifier) })),
    case_finishes: (finishes.data ?? []).map((s) => ({ ...s, price_modifier: Number(s.price_modifier) })),
    watch_sizes: (sizes.data ?? []).map((s) => ({ ...s, price_modifier: Number(s.price_modifier) })),
    warranty_options: (warranties.data ?? []).map((s) => ({ ...s, price_modifier: Number(s.price_modifier) })),
    testimonials: testimonials.data ?? [],
    faq: faq.data ?? [],
    settings: settingsMap,
  };
});