import { useMemo } from "react";
import { motion } from "framer-motion";
import type { CatalogPayload } from "@/lib/catalog.functions";
import { useConfigurator } from "@/lib/configurator-store";
import { formatPrice, formatPriceSigned } from "@/lib/format";
import { WatchPreview } from "./watch-preview";
import { Link } from "@tanstack/react-router";

type Props = { catalog: CatalogPayload };

export function Configurator({ catalog }: Props) {
  const cfg = useConfigurator();

  // Default selections on first paint
  const ids = useMemo(
    () => ({
      strap: cfg.strapId ?? catalog.straps[0]?.id ?? null,
      dial: cfg.dialColorId ?? catalog.dial_colors[0]?.id ?? null,
      case: cfg.caseFinishId ?? catalog.case_finishes[0]?.id ?? null,
      size: cfg.watchSizeId ?? catalog.watch_sizes[0]?.id ?? null,
      warranty: cfg.warrantyId ?? catalog.warranty_options[0]?.id ?? null,
    }),
    [cfg, catalog],
  );

  const strap = catalog.straps.find((s) => s.id === ids.strap);
  const dial = catalog.dial_colors.find((s) => s.id === ids.dial);
  const caseFinish = catalog.case_finishes.find((s) => s.id === ids.case);
  const size = catalog.watch_sizes.find((s) => s.id === ids.size);
  const warranty = catalog.warranty_options.find((s) => s.id === ids.warranty);

  const giftPrice = Number(catalog.settings["gift_packaging_price"] ?? 10);
  const engravingPrice = Number(catalog.settings["engraving_price"] ?? 0);

  const modifiers =
    (strap?.price_modifier ?? 0) +
    (dial?.price_modifier ?? 0) +
    (caseFinish?.price_modifier ?? 0) +
    (size?.price_modifier ?? 0) +
    (warranty?.price_modifier ?? 0) +
    (cfg.giftPackaging ? giftPrice : 0) +
    (cfg.engravingText ? engravingPrice : 0);

  const total = catalog.product.base_price + modifiers;

  return (
    <div id="configure" className="relative grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-16">
      {/* PREVIEW */}
      <div className="lg:sticky lg:top-24 self-start">
        <div className="eyebrow mb-4">Live Preview / Atelier No. 04</div>
        <WatchPreview
          caseFinishName={caseFinish?.name}
          dialHex={dial?.hex_code}
          dialName={dial?.name}
          strapName={strap?.name}
          strapSwatch={strap?.swatch_color}
          sizeLabel={size?.size}
          engraving={cfg.engravingText}
        />
      </div>

      {/* CONTROLS */}
      <div className="space-y-10">
        <div>
          <div className="eyebrow">01 / Strap</div>
          <h3 className="font-display text-3xl mt-1 mb-4">Choose your band.</h3>
          <SwatchGrid
            items={catalog.straps}
            selectedId={ids.strap}
            onSelect={(id) => cfg.set({ strapId: id })}
            renderSwatch={(s) => (
              <span
                className="w-full h-full block"
                style={{ background: s.swatch_color ?? "#888" }}
              />
            )}
          />
        </div>

        <div>
          <div className="eyebrow">02 / Dial Color</div>
          <h3 className="font-display text-3xl mt-1 mb-4">Set the tone.</h3>
          <SwatchGrid
            items={catalog.dial_colors}
            selectedId={ids.dial}
            onSelect={(id) => cfg.set({ dialColorId: id })}
            renderSwatch={(s) => <span className="w-full h-full block" style={{ background: s.hex_code ?? "#888" }} />}
          />
        </div>

        <div>
          <div className="eyebrow">03 / Case Finish</div>
          <h3 className="font-display text-3xl mt-1 mb-4">Forge the body.</h3>
          <SwatchGrid
            items={catalog.case_finishes}
            selectedId={ids.case}
            onSelect={(id) => cfg.set({ caseFinishId: id })}
            renderSwatch={(s) => <span className="w-full h-full block" style={{ background: s.hex_code ?? "#888" }} />}
          />
        </div>

        <div>
          <div className="eyebrow">04 / Size</div>
          <h3 className="font-display text-3xl mt-1 mb-4">Wear it your way.</h3>
          <div className="flex gap-2 flex-wrap">
            {catalog.watch_sizes.map((s) => {
              const active = ids.size === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => cfg.set({ watchSizeId: s.id })}
                  className={`px-5 py-3 border font-mono text-sm transition ${
                    active
                      ? "border-ember bg-ember text-ink"
                      : "border-white/10 hover:border-cream/40 text-cream/80"
                  }`}
                >
                  {s.size}
                  <span className="block text-[10px] tracking-[0.2em] mt-0.5 opacity-70">
                    {formatPriceSigned(s.price_modifier)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="eyebrow">05 / Engraving</div>
          <h3 className="font-display text-3xl mt-1 mb-4">Make it yours.</h3>
          <input
            type="text"
            aria-label="Engraving text"
            maxLength={25}
            value={cfg.engravingText}
            onChange={(e) => cfg.set({ engravingText: e.target.value })}
            placeholder='e.g. "For Dad ❤️"'
            className="w-full bg-transparent border-b border-white/20 focus:border-ember outline-none py-3 font-display text-xl placeholder:text-cream/30 transition"
          />
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40 flex justify-between">
            <span>Up to 25 chars · complimentary</span>
            <span>{cfg.engravingText.length}/25</span>
          </div>
        </div>

        <div>
          <div className="eyebrow">06 / Warranty</div>
          <h3 className="font-display text-3xl mt-1 mb-4">Cover your craft.</h3>
          <div className="grid sm:grid-cols-3 gap-2">
            {catalog.warranty_options.map((w) => {
              const active = ids.warranty === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => cfg.set({ warrantyId: w.id })}
                  className={`text-left p-4 border transition ${
                    active
                      ? "border-ember bg-ember/5"
                      : "border-white/10 hover:border-cream/40"
                  }`}
                >
                  <div className="text-cream text-sm">{w.name}</div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-cream/50 mt-1">
                    {formatPriceSigned(w.price_modifier)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center justify-between p-5 border border-white/10 hover:border-cream/30 cursor-pointer transition">
          <div>
            <div className="eyebrow">07 / Gift Packaging</div>
            <div className="text-cream mt-1">Premium walnut box, ribbon, hand-written card</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-cream/60">+{formatPrice(giftPrice)}</span>
            <span
              className={`relative w-12 h-6 transition ${cfg.giftPackaging ? "bg-ember" : "bg-white/15"}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={cfg.giftPackaging}
                onChange={(e) => cfg.set({ giftPackaging: e.target.checked })}
              />
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-cream transition ${cfg.giftPackaging ? "translate-x-6" : ""}`}
              />
            </span>
          </div>
        </label>

        {/* PRICE + CTA */}
        <div className="border-t border-white/10 pt-8 space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Total / configured</div>
            <motion.div
              key={total}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="font-display text-5xl text-cream"
            >
              {formatPrice(total)}
            </motion.div>
          </div>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-cream/40">
            Base {formatPrice(catalog.product.base_price)} · Upgrades {formatPriceSigned(modifiers)}
          </div>
          <Link
            to="/checkout"
            className="group flex items-center justify-between w-full bg-ember text-ink font-mono text-sm uppercase tracking-[0.25em] py-5 px-6 hover:bg-cream transition-colors"
          >
            <span>Review & Checkout</span>
            <span className="group-hover:translate-x-2 transition">→</span>
          </Link>
          <p className="text-center font-mono text-[10px] tracking-[0.25em] uppercase text-cream/40">
            Hand-assembled · Ships in 7–10 days · Free worldwide
          </p>
        </div>
      </div>
    </div>
  );
}

type WithId = { id: string; name: string; price_modifier: number };

function SwatchGrid<T extends WithId>({
  items,
  selectedId,
  onSelect,
  renderSwatch,
}: {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  renderSwatch: (item: T) => React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((it) => {
        const active = selectedId === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={`group relative p-3 border transition text-left ${
              active ? "border-ember" : "border-white/10 hover:border-cream/40"
            }`}
          >
            <div className="aspect-square w-full overflow-hidden border border-white/10">
              {renderSwatch(it)}
            </div>
            <div className="mt-2 text-cream text-xs leading-tight">{it.name}</div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-cream/50 mt-0.5">
              {formatPriceSigned(it.price_modifier)}
            </div>
            {active && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ember" />
            )}
          </button>
        );
      })}
    </div>
  );
}