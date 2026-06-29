import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ShippingSchema = z.object({
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().default(""),
  city: z.string().min(1).max(120),
  region: z.string().max(120).optional().default(""),
  postal_code: z.string().min(1).max(40),
  country: z.string().min(2).max(80),
});

const OrderInputSchema = z.object({
  product_id: z.string().uuid(),
  strap_id: z.string().uuid(),
  dial_color_id: z.string().uuid(),
  case_finish_id: z.string().uuid(),
  watch_size_id: z.string().uuid(),
  warranty_id: z.string().uuid(),
  engraving_text: z.string().max(25).optional().default(""),
  gift_packaging: z.boolean(),
  total_price: z.number().positive().max(100000),
  snapshot_base_price: z.number().positive(),
  snapshot_total_modifiers: z.number(),
  customer_name: z.string().min(1).max(160),
  customer_email: z.string().email().max(200),
  shipping_address: ShippingSchema,
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => OrderInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_id: userId,
        total_price: data.total_price,
        shipping_address: data.shipping_address,
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        status: "pending",
      })
      .select("id")
      .single();
    if (error || !order) throw new Error(error?.message ?? "Order failed");

    const { error: cfgErr } = await supabase.from("order_configurations").insert({
      order_id: order.id,
      product_id: data.product_id,
      strap_id: data.strap_id,
      dial_color_id: data.dial_color_id,
      case_finish_id: data.case_finish_id,
      watch_size_id: data.watch_size_id,
      warranty_id: data.warranty_id,
      engraving_text: data.engraving_text || null,
      gift_packaging: data.gift_packaging,
      snapshot_base_price: data.snapshot_base_price,
      snapshot_total_modifiers: data.snapshot_total_modifiers,
    });
    if (cfgErr) throw new Error(cfgErr.message);
    return { id: order.id };
  });

export type MyOrder = {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  config: {
    engraving_text: string | null;
    gift_packaging: boolean;
    strap: string | null;
    dial_color: string | null;
    case_finish: string | null;
    watch_size: string | null;
    warranty: string | null;
  } | null;
};

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyOrder[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("orders")
      .select(`id,total_price,status,created_at,customer_name,customer_email,
        order_configurations(engraving_text,gift_packaging,
          straps(name),dial_colors(name),case_finishes(name),watch_sizes(size),warranty_options(name))`)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((o) => {
      const cfg = (o.order_configurations as any[])?.[0] ?? null;
      return {
        id: o.id,
        total_price: Number(o.total_price),
        status: o.status as string,
        created_at: o.created_at as string,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
        config: cfg ? {
          engraving_text: cfg.engraving_text,
          gift_packaging: cfg.gift_packaging,
          strap: cfg.straps?.name ?? null,
          dial_color: cfg.dial_colors?.name ?? null,
          case_finish: cfg.case_finishes?.name ?? null,
          watch_size: cfg.watch_sizes?.size ?? null,
          warranty: cfg.warranty_options?.name ?? null,
        } : null,
      };
    });
  });

export const getOrderById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<MyOrder | null> => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("orders")
      .select(`id,total_price,status,created_at,customer_name,customer_email,
        order_configurations(engraving_text,gift_packaging,
          straps(name),dial_colors(name),case_finishes(name),watch_sizes(size),warranty_options(name))`)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const cfg = (row.order_configurations as any[])?.[0] ?? null;
    return {
      id: row.id,
      total_price: Number(row.total_price),
      status: row.status as string,
      created_at: row.created_at as string,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      config: cfg ? {
        engraving_text: cfg.engraving_text,
        gift_packaging: cfg.gift_packaging,
        strap: cfg.straps?.name ?? null,
        dial_color: cfg.dial_colors?.name ?? null,
        case_finish: cfg.case_finishes?.name ?? null,
        watch_size: cfg.watch_sizes?.size ?? null,
        warranty: cfg.warranty_options?.name ?? null,
      } : null,
    };
  });

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("profiles").select("role").eq("id", context.userId).maybeSingle();
    return { admin: data?.role === "admin" };
  });

export const getAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyOrder[]> => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(`id,total_price,status,created_at,customer_name,customer_email,
        order_configurations(engraving_text,gift_packaging,
          straps(name),dial_colors(name),case_finishes(name),watch_sizes(size),warranty_options(name))`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((o) => {
      const cfg = (o.order_configurations as any[])?.[0] ?? null;
      return {
        id: o.id,
        total_price: Number(o.total_price),
        status: o.status as string,
        created_at: o.created_at as string,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
        config: cfg ? {
          engraving_text: cfg.engraving_text,
          gift_packaging: cfg.gift_packaging,
          strap: cfg.straps?.name ?? null,
          dial_color: cfg.dial_colors?.name ?? null,
          case_finish: cfg.case_finishes?.name ?? null,
          watch_size: cfg.watch_sizes?.size ?? null,
          warranty: cfg.warranty_options?.name ?? null,
        } : null,
      };
    });
  });