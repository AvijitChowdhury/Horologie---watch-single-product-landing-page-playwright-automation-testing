import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCatalog } from "@/lib/catalog.functions";
import { createOrder } from "@/lib/orders.functions";
import { useConfigurator } from "@/lib/configurator-store";
import { formatPrice } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { toast } from "sonner";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Review & Checkout · Horologie" },
      { name: "description", content: "Review your Horologie configuration and place your made-to-order request." },
      { property: "og:title", content: "Review & Checkout · Horologie" },
      { property: "og:description", content: "Review your custom Horologie and place your order." },
      { property: "og:url", content: "https://chronocraftavijit.lovable.app/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://chronocraftavijit.lovable.app/checkout" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const navigate = useNavigate();
  const cfg = useConfigurator();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postal_code: "",
    country: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      if (data.user) {
        setForm((f) => ({
          ...f,
          customer_email: data.user!.email ?? "",
          customer_name: (data.user!.user_metadata?.full_name as string) ?? "",
        }));
      }
    });
  }, []);

  const ids = {
    strap: cfg.strapId ?? catalog.straps[0]?.id,
    dial: cfg.dialColorId ?? catalog.dial_colors[0]?.id,
    case: cfg.caseFinishId ?? catalog.case_finishes[0]?.id,
    size: cfg.watchSizeId ?? catalog.watch_sizes[0]?.id,
    warranty: cfg.warrantyId ?? catalog.warranty_options[0]?.id,
  };
  const strap = catalog.straps.find((s) => s.id === ids.strap);
  const dial = catalog.dial_colors.find((s) => s.id === ids.dial);
  const caseFinish = catalog.case_finishes.find((s) => s.id === ids.case);
  const size = catalog.watch_sizes.find((s) => s.id === ids.size);
  const warranty = catalog.warranty_options.find((s) => s.id === ids.warranty);

  const giftPrice = Number(catalog.settings["gift_packaging_price"] ?? 10);
  const engravingPrice = Number(catalog.settings["engraving_price"] ?? 0);
  const modifiers = useMemo(() =>
    (strap?.price_modifier ?? 0) +
    (dial?.price_modifier ?? 0) +
    (caseFinish?.price_modifier ?? 0) +
    (size?.price_modifier ?? 0) +
    (warranty?.price_modifier ?? 0) +
    (cfg.giftPackaging ? giftPrice : 0) +
    (cfg.engravingText ? engravingPrice : 0),
    [strap, dial, caseFinish, size, warranty, cfg, giftPrice, engravingPrice],
  );
  const total = catalog.product.base_price + modifiers;

  if (authed === null) return null;
  if (authed === false) {
    return (
      <div className="min-h-screen bg-ink text-cream">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-32 text-center">
          <div className="eyebrow">Sign in to continue</div>
          <h1 className="font-display text-5xl mt-3">Your craft awaits.</h1>
          <p className="text-cream/60 mt-3">Create an account or sign in to place your made-to-order request.</p>
          <Link to="/auth" className="inline-block mt-8 bg-ember text-ink font-mono text-sm uppercase tracking-[0.25em] px-7 py-4">
            Sign in →
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!strap || !dial || !caseFinish || !size || !warranty) {
      toast.error("Please complete your configuration first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createOrder({
        data: {
          product_id: catalog.product.id,
          strap_id: strap.id,
          dial_color_id: dial.id,
          case_finish_id: caseFinish.id,
          watch_size_id: size.id,
          warranty_id: warranty.id,
          engraving_text: cfg.engravingText,
          gift_packaging: cfg.giftPackaging,
          total_price: total,
          snapshot_base_price: catalog.product.base_price,
          snapshot_total_modifiers: modifiers,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          shipping_address: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            region: form.region,
            postal_code: form.postal_code,
            country: form.country,
          },
        },
      });
      toast.success("Order placed. We'll begin crafting today.");
      cfg.reset();
      navigate({ to: "/orders/$id", params: { id: res.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-6 py-16 grid lg:grid-cols-[1.4fr_1fr] gap-12">
        <form onSubmit={submit} className="space-y-10">
          <div>
            <div className="eyebrow">Checkout</div>
            <h1 className="font-display text-5xl mt-2">Review & confirm.</h1>
          </div>

          <section>
            <h2 className="font-display text-2xl mb-4">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} required />
              <Input label="Email" type="email" value={form.customer_email} onChange={(v) => setForm({ ...form, customer_email: v })} required />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">Shipping</h2>
            <div className="grid gap-4">
              <Input label="Address line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} required />
              <Input label="Address line 2" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                <Input label="State / Region" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Postal code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} required />
                <Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ember text-ink font-mono text-sm uppercase tracking-[0.25em] py-5 hover:bg-cream transition disabled:opacity-50"
          >
            {submitting ? "Placing order…" : `Place mock order · ${formatPrice(total)}`}
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40 text-center">
            No payment will be collected. This is a demo checkout.
          </p>
        </form>

        <aside className="lg:sticky lg:top-24 self-start border border-white/10 p-6 space-y-4">
          <div className="eyebrow">Your build</div>
          <h3 className="font-display text-2xl">{catalog.product.name}</h3>
          <dl className="text-sm divide-y divide-white/10">
            <Row k="Strap" v={strap?.name} />
            <Row k="Dial" v={dial?.name} />
            <Row k="Case" v={caseFinish?.name} />
            <Row k="Size" v={size?.size} />
            <Row k="Warranty" v={warranty?.name} />
            {cfg.engravingText && <Row k="Engraving" v={`"${cfg.engravingText}"`} />}
            {cfg.giftPackaging && <Row k="Gift packaging" v="Yes" />}
          </dl>
          <div className="border-t border-white/10 pt-4 flex items-baseline justify-between">
            <span className="eyebrow">Total</span>
            <span className="font-display text-3xl">{formatPrice(total)}</span>
          </div>
          <Link to="/" hash="configure" className="block text-center font-mono text-[10px] uppercase tracking-[0.25em] text-cream/50 hover:text-cream">
            ← Edit configuration
          </Link>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full bg-transparent border-b border-white/20 focus:border-ember outline-none py-2 text-cream"
      />
    </label>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <dt className="text-cream/50">{k}</dt>
      <dd className="text-cream text-right">{v ?? "—"}</dd>
    </div>
  );
}