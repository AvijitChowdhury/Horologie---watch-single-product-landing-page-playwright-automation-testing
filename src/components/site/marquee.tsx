export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee border-y border-white/5 bg-surface/30 py-4 overflow-hidden">
      <div className="flex shrink-0 gap-12 font-mono text-xs uppercase tracking-[0.3em] text-cream/60 whitespace-nowrap pr-12">
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            <span className="w-1.5 h-1.5 rounded-full bg-ember" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}