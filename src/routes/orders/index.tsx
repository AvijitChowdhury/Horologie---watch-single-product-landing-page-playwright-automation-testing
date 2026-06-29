import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "My Orders · ChronoCraft" }] }),
  component: OrdersIndex,
});

function OrdersIndex() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate({ to: "/auth" });
      else setAuthed(true);
    });
  }, [navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => getMyOrders(),
    enabled: !!authed,
  });

  if (!authed) return null;
  return (
    <div className="min-h-screen bg-ink text-cream">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-6 py-16">
        <div className="eyebrow">Orders</div>
        <h1 className="font-display text-5xl mt-2 mb-10">Your atelier history.</h1>
        {isLoading ? (
          <p className="text-cream/50">Loading…</p>
        ) : !orders || orders.length === 0 ? (
          <div className="border border-white/10 p-10 text-center">
            <p className="text-cream/60">No orders yet. Begin your first build.</p>
            <Link to="/" className="inline-block mt-6 bg-ember text-ink font-mono text-xs uppercase tracking-[0.25em] px-5 py-3">
              Open configurator →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10 border-y border-white/10">
            {orders.map((o) => (
              <Link
                key={o.id}
                to="/orders/$id"
                params={{ id: o.id }}
                className="grid sm:grid-cols-[1fr_auto_auto] items-center gap-6 py-5 hover:bg-white/[0.02] px-2 transition"
              >
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40">
                    #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}
                  </div>
                  <div className="font-display text-xl mt-1">
                    {o.config?.case_finish} · {o.config?.dial_color} · {o.config?.strap}
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold border border-gold/30 px-3 py-1">
                  {o.status}
                </span>
                <div className="font-display text-2xl text-right">{formatPrice(o.total_price)}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}