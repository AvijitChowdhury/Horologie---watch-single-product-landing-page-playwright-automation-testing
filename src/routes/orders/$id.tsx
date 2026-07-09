import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "Order Details · Horologie" },
      { name: "description", content: "Details and production status for your Horologie order." },
      { property: "og:title", content: "Order Details · Horologie" },
      { property: "og:url", content: `https://chronocraftavijit.lovable.app/orders/${params.id}` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `https://chronocraftavijit.lovable.app/orders/${params.id}` }],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate({ to: "/auth" });
      else setAuthed(true);
    });
  }, [navigate]);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById({ data: { id } }),
    enabled: !!authed,
  });

  if (!authed) return null;
  return (
    <div className="min-h-screen bg-ink text-cream">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/orders" className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40 hover:text-cream">← All orders</Link>
        {isLoading ? (
          <p className="mt-6 text-cream/50">Loading…</p>
        ) : !order ? (
          <p className="mt-6">Order not found.</p>
        ) : (
          <>
            <div className="eyebrow mt-6">Order #{order.id.slice(0, 8)}</div>
            <h1 className="font-display text-5xl mt-2">It's being made.</h1>
            <p className="text-cream/60 mt-3">Placed {new Date(order.created_at).toLocaleString()}</p>

            <div className="mt-10 border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Status</span>
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold border border-gold/30 px-3 py-1">{order.status}</span>
              </div>
            </div>

            <div className="mt-6 border border-white/10 divide-y divide-white/10">
              <Row k="Case" v={order.config?.case_finish} />
              <Row k="Dial" v={order.config?.dial_color} />
              <Row k="Strap" v={order.config?.strap} />
              <Row k="Size" v={order.config?.watch_size} />
              <Row k="Warranty" v={order.config?.warranty} />
              {order.config?.engraving_text && <Row k="Engraving" v={`"${order.config.engraving_text}"`} />}
              {order.config?.gift_packaging && <Row k="Gift packaging" v="Yes" />}
              <Row k="Shipping to" v={`${order.customer_name} · ${order.customer_email}`} />
            </div>

            <div className="mt-8 flex items-baseline justify-between border-t border-white/10 pt-6">
              <span className="eyebrow">Total paid</span>
              <span className="font-display text-4xl">{formatPrice(order.total_price)}</span>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex justify-between p-4 gap-4">
      <span className="text-cream/50 text-sm">{k}</span>
      <span className="text-cream text-sm text-right">{v ?? "—"}</span>
    </div>
  );
}