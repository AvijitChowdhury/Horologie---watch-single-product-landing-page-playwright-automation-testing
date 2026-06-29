import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders, isAdmin } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · ChronoCraft" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "denied" | "ok">("checking");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      try {
        const res = await isAdmin();
        setState(res.admin ? "ok" : "denied");
      } catch {
        setState("denied");
      }
    })();
  }, [navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: () => getAllOrders(),
    enabled: state === "ok",
  });

  return (
    <div className="min-h-screen bg-ink text-cream">
      <SiteHeader />
      <main className="mx-auto max-w-[1300px] px-6 py-16">
        <div className="eyebrow">Admin · Atelier Console</div>
        <h1 className="font-display text-5xl mt-2 mb-10">All orders.</h1>
        {state === "checking" && <p className="text-cream/50">Verifying access…</p>}
        {state === "denied" && (
          <div className="border border-white/10 p-10 text-center">
            <p className="text-cream/60">You don't have admin access.</p>
          </div>
        )}
        {state === "ok" && (
          isLoading ? (
            <p className="text-cream/50">Loading…</p>
          ) : (
            <div className="border border-white/10 divide-y divide-white/10">
              <div className="grid grid-cols-[1fr_1.2fr_1fr_auto_auto] gap-4 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40">
                <div>Order</div><div>Build</div><div>Customer</div><div>Status</div><div className="text-right">Total</div>
              </div>
              {(orders ?? []).map((o) => (
                <div key={o.id} className="grid grid-cols-[1fr_1.2fr_1fr_auto_auto] gap-4 px-4 py-4 items-center">
                  <div>
                    <div className="font-mono text-xs text-cream">#{o.id.slice(0, 8)}</div>
                    <div className="text-[10px] text-cream/40">{new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm">{o.config?.case_finish} · {o.config?.dial_color} · {o.config?.strap}</div>
                  <div className="text-sm">
                    <div>{o.customer_name}</div>
                    <div className="text-cream/40 text-xs">{o.customer_email}</div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold border border-gold/30 px-2 py-1">{o.status}</span>
                  <div className="font-display text-xl text-right">{formatPrice(o.total_price)}</div>
                </div>
              ))}
              {(orders ?? []).length === 0 && <div className="p-10 text-center text-cream/50">No orders yet.</div>}
            </div>
          )
        )}
      </main>
      <SiteFooter />
    </div>
  );
}