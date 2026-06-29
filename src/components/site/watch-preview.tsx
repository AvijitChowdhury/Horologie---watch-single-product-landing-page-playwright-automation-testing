import { AnimatePresence, motion } from "framer-motion";
import silver from "@/assets/watch-silver.jpg";
import black from "@/assets/watch-black.jpg";
import gold from "@/assets/watch-gold.jpg";
import rosegold from "@/assets/watch-rosegold.jpg";

const IMAGE_BY_FINISH: Record<string, string> = {
  "Brushed Silver": silver,
  "Stealth Black": black,
  "18k Gold": gold,
  "Rose Gold": rosegold,
};

type Props = {
  caseFinishName?: string | null;
  dialHex?: string | null;
  dialName?: string | null;
  strapName?: string | null;
  strapSwatch?: string | null;
  sizeLabel?: string | null;
  engraving?: string;
};

export function WatchPreview({
  caseFinishName,
  dialHex,
  dialName,
  strapName,
  strapSwatch,
  sizeLabel,
  engraving,
}: Props) {
  const img = IMAGE_BY_FINISH[caseFinishName ?? "Brushed Silver"] ?? silver;

  return (
    <div className="relative ember-glow">
      <div className="relative aspect-square w-full max-w-[640px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.img
            key={img}
            src={img}
            alt={`Horologie watch with ${caseFinishName ?? ""} case`}
            width={1280}
            height={1280}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full h-full object-cover rounded-sm"
          />
        </AnimatePresence>
        {/* Dial color tint overlay — subtle */}
        {dialHex ? (
          <motion.div
            key={dialHex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0 z-20 mix-blend-color rounded-sm"
            style={{ background: dialHex }}
          />
        ) : null}

        {/* Crosshair frame */}
        <div className="pointer-events-none absolute inset-0 z-30">
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </div>

        {/* Size badge */}
        <div className="absolute top-4 left-4 z-30 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/70 bg-ink/60 backdrop-blur px-3 py-1.5 border border-white/10">
          {sizeLabel ?? "—"}
        </div>
      </div>

      {/* Live readouts */}
      <div className="mt-6 grid grid-cols-3 gap-px bg-white/5 text-xs">
        <Readout label="Case" value={caseFinishName ?? "—"} />
        <Readout label="Dial" value={dialName ?? "—"} swatch={dialHex ?? undefined} />
        <Readout label="Strap" value={strapName ?? "—"} swatch={strapSwatch ?? undefined} />
      </div>
      {engraving ? (
        <div className="mt-4 text-center font-display italic text-gold text-lg">
          “{engraving}”
        </div>
      ) : null}
    </div>
  );
}

function Readout({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  return (
    <div className="bg-ink p-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-cream/40">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        {swatch ? <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: swatch }} /> : null}
        <span className="text-cream text-sm truncate">{value}</span>
      </div>
    </div>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const cls: Record<typeof pos, string> = {
    tl: "top-2 left-2 border-l border-t",
    tr: "top-2 right-2 border-r border-t",
    bl: "bottom-2 left-2 border-l border-b",
    br: "bottom-2 right-2 border-r border-b",
  };
  return <span className={`absolute ${cls[pos]} w-4 h-4 border-ember/60`} />;
}