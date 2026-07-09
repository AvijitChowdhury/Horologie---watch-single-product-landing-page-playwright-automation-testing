import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getCatalog, type CatalogPayload } from "@/lib/catalog.functions";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Marquee } from "@/components/site/marquee";
import { Configurator } from "@/components/site/configurator";
import { formatPrice } from "@/lib/format";
import craftMovement from "@/assets/craft-movement.jpg";
import watchSilver from "@/assets/watch-silver.jpg";

const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
});

export const Route = createFileRoute("/")({
  head: ({ loaderData }: { loaderData?: CatalogPayload }) => {
    const url = "https://chronocraftavijit.lovable.app/";
    const product = loaderData?.product;
    const testimonials = loaderData?.testimonials ?? [];
    const faq = loaderData?.faq ?? [];
    const ratingAvg =
      testimonials.length > 0
        ? (testimonials.reduce((s, t) => s + (t.rating ?? 0), 0) / testimonials.length).toFixed(1)
        : null;
    return {
      meta: [
        { title: "Horologie — Design Your Own Luxury Watch" },
        { name: "description", content: "Configure a one-of-a-kind Horologie timepiece. Swiss movement, sapphire glass, 25 characters of engraving — yours, made to order." },
        { property: "og:title", content: "Horologie — Design Your Own Luxury Watch" },
        { property: "og:description", content: "Hand-assembled Swiss movement. Live configurator. Made to order in 7–10 days." },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "preload", as: "image", href: watchSilver, fetchpriority: "high" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product?.name ?? "Horologie Custom Timepiece",
            description: product?.description ?? "Hand-assembled Swiss luxury watch, configured to order.",
            brand: { "@type": "Brand", name: "Horologie" },
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: product?.base_price ?? 0,
              availability: "https://schema.org/InStock",
              url,
            },
            ...(ratingAvg && testimonials.length > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: ratingAvg,
                    reviewCount: testimonials.length,
                  },
                }
              : {}),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        },
      ],
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Landing,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Atelier offline</h1>
        <p className="mt-2 text-cream/60">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-12">Not found.</div>,
});

function Landing() {
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  return (
    <div className="min-h-screen bg-ink text-cream">
      <SiteHeader />
      <main>
      <Hero basePrice={catalog.product.base_price} />
      <Marquee
        items={[
          "Hand-assembled in Geneva",
          "Swiss movement, sapphire glass",
          "Made to order · 7–10 days",
          "Free worldwide shipping",
          "25 characters of engraving — complimentary",
        ]}
      />
      <section className="mx-auto max-w-[1400px] px-6 py-24">
        <header className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow">The Configurator</div>
            <h2 className="font-display text-5xl md:text-6xl mt-2">Build it. Live.</h2>
          </div>
          <div className="hidden md:block max-w-xs text-cream/60 text-sm">
            Every choice updates the price and preview instantly. No surprises at checkout.
          </div>
        </header>
        <Configurator catalog={catalog} />
      </section>

      <Craft />
      <Included />
      <Reviews testimonials={catalog.testimonials} />
      <Faq faq={catalog.faq} />
      <Cta />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero({ basePrice }: { basePrice: number }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-24 grid lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="eyebrow"
          >
            Atelier No. 04 · Edition One
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05 }}
            className="font-display text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] tracking-tight mt-4"
          >
            Time, <em className="italic text-ember">configured</em>.<br />
            Built for <span className="italic text-gold">one</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-6 max-w-md text-cream/70 text-lg"
          >
            A single watch with infinite expression. Choose every detail — strap, dial, case, the words on the back — and we will build it by hand.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex items-center gap-6"
          >
            <a
              href="#configure"
              className="group bg-ember text-ink font-mono text-sm uppercase tracking-[0.25em] px-7 py-4 hover:bg-cream transition-colors flex items-center gap-3"
            >
              Configure now
              <span className="group-hover:translate-x-2 transition">→</span>
            </a>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40">From</div>
              <div className="font-display text-2xl">{formatPrice(basePrice)}</div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="ember-glow"
          >
            <img
              src={watchSilver}
              alt="Horologie watch"
              width={1280}
              height={1280}
              fetchPriority="high"
              decoding="async"
              className="relative z-10 w-full max-w-md mx-auto rounded-sm"
            />
          </motion.div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/50">
            <span className="w-8 h-px bg-cream/30" />
            Tap to begin
            <span className="w-8 h-px bg-cream/30" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Craft() {
  const items = [
    { k: "01", t: "Sapphire Crystal", d: "Scratch-resistant. Anti-reflective on both faces." },
    { k: "02", t: "Swiss Movement", d: "Self-winding caliber, 42-hour reserve, 28,800 vph." },
    { k: "03", t: "316L Stainless", d: "Surgical-grade case, brushed and polished by hand." },
    { k: "04", t: "10 ATM", d: "Water resistant to 100 metres. Swim it. Live in it." },
  ];
  return (
    <section id="craft" className="mx-auto max-w-[1400px] px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
      <div className="ember-glow">
        <img
          src={craftMovement}
          alt="Macro detail of swiss movement"
          width={1280}
          height={960}
          loading="lazy"
          className="relative z-10 w-full rounded-sm"
        />
      </div>
      <div>
        <div className="eyebrow">Craftsmanship</div>
        <h2 className="font-display text-5xl md:text-6xl mt-2 leading-none">
          Built for <em className="italic text-ember">generations</em>.
        </h2>
        <p className="mt-5 text-cream/70 max-w-md">
          Every Horologie passes through eleven pairs of hands. We assemble each movement, polish each lug, and sign the case-back before it leaves the atelier.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-px bg-white/5">
          {items.map((i) => (
            <div key={i.k} className="bg-ink p-6">
              <div className="font-mono text-[10px] tracking-[0.25em] text-gold">— {i.k}</div>
              <div className="mt-2 font-display text-2xl">{i.t}</div>
              <p className="mt-2 text-cream/60 text-sm">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Included() {
  const items = ["The Watch", "Walnut Box", "Polishing Cloth", "Warranty Card"];
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24">
      <div className="eyebrow">In the box</div>
      <h2 className="font-display text-5xl mt-2 mb-10">What you'll unbox.</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
        {items.map((t, i) => (
          <div key={t} className="bg-ink aspect-[4/5] p-6 flex flex-col justify-between border border-transparent hover:border-ember/30 transition">
            <div className="font-mono text-[10px] tracking-[0.25em] text-cream/40">0{i + 1}</div>
            <div className="font-display text-2xl">{t}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Reviews({ testimonials }: { testimonials: { id: string; customer_name: string; content: string; rating: number }[] }) {
  return (
    <section id="reviews" className="mx-auto max-w-[1400px] px-6 py-24">
      <div className="flex items-end justify-between mb-12 gap-6">
        <div>
          <div className="eyebrow">Owners</div>
          <h2 className="font-display text-5xl md:text-6xl mt-2">Verified, devoted.</h2>
        </div>
        <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-cream/50">
          {testimonials.length.toString().padStart(3, "0")} reviews · 4.9 / 5
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testimonials.map((t) => (
          <article key={t.id} className="border border-white/10 p-6 hover:border-ember/40 transition group">
            <div className="text-gold text-sm">{"★".repeat(t.rating)}</div>
            <p className="font-display italic text-lg mt-3 leading-snug">"{t.content}"</p>
            <div className="mt-6 font-mono text-[10px] tracking-[0.25em] uppercase text-cream/50">
              — {t.customer_name}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Faq({ faq }: { faq: { id: string; category: string; question: string; answer: string }[] }) {
  return (
    <section id="faq" className="mx-auto max-w-[1400px] px-6 py-24">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
        <div>
          <div className="eyebrow">FAQ</div>
          <h2 className="font-display text-5xl md:text-6xl mt-2 leading-none">Questions, answered.</h2>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {faq.map((f) => (
            <details key={f.id} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-display text-xl">{f.question}</span>
                <span className="text-ember font-mono text-2xl transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 text-cream/70 max-w-2xl">
                <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-gold mb-1">{f.category}</div>
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-6 py-32 text-center">
      <div className="eyebrow">Begin</div>
      <h2 className="font-display text-[clamp(3rem,10vw,10rem)] leading-[0.9] mt-4">
        <em className="italic text-ember">Yours.</em><br />Made for one.
      </h2>
      <a
        href="#configure"
        className="inline-flex items-center gap-3 mt-10 bg-cream text-ink font-mono text-sm uppercase tracking-[0.25em] px-8 py-5 hover:bg-ember transition-colors"
      >
        Configure your Horologie →
      </a>
    </section>
  );
}
