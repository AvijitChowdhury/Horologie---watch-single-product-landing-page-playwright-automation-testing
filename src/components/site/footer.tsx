export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-32">
      <div className="mx-auto max-w-[1400px] px-6 py-12 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="font-display text-3xl">Horologie<span className="text-ember">™</span></div>
          <p className="mt-3 text-cream/60 max-w-sm">Hand-assembled in our Geneva atelier. Configured by you, made for one.</p>
        </div>
        <div>
          <div className="eyebrow mb-3">Care</div>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>Warranty</li><li>Servicing</li><li>Shipping</li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-3">Contact</div>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>atelier@horologie.example</li><li>+41 22 555 0140</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40">
        © {new Date().getFullYear()} Horologie — Atelier No. 04
      </div>
    </footer>
  );
}