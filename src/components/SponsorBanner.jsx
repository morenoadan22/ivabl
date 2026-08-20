import { Link } from "react-router-dom";
import { sponsors } from "../data/sponsors.js";

export function SponsorStrip({ compact = false }) {
  if (sponsors.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-gold/40 bg-cream/40 ${compact ? "p-3" : "p-4 sm:p-5"}`}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="text-sm">
            <div className="font-display font-bold text-navy">Our Sponsors</div>
            <div className="text-navy/60 text-xs sm:text-sm">Support local baseball — your logo here. Gold sponsors get field banners + PA + uniform patch.</div>
          </div>
          <Link to="/sponsors" className="inline-flex shrink-0 px-4 py-2 rounded-full bg-navy text-white text-xs sm:text-sm font-bold hover:bg-navy-deep transition">
            Become a Sponsor →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-white ring-1 ring-black/5 overflow-hidden ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black tracking-[0.16em] text-navy/50">OUR SPONSORS</span>
        <Link to="/sponsors" className="text-xs font-bold text-navy/60 hover:text-navy">View all →</Link>
      </div>
      <div className={`grid gap-3 ${compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
        {sponsors.map(s => (
          <a
            key={s.name}
            href={s.url || "/sponsors"}
            target={s.url ? "_blank" : undefined}
            rel={s.url ? "noreferrer" : undefined}
            className={`rounded-xl border bg-cream/30 p-3 flex flex-col items-center justify-center text-center hover:bg-cream/60 transition min-h-[90px] ${s.tier === "Gold" ? "ring-1 ring-gold/40 border-gold/40" : "border-black/5"}`}
          >
            {s.logo ? (
              <img src={s.logo} alt={s.name} className="max-h-10 max-w-full object-contain" />
            ) : (
              <span className="font-display font-bold text-navy text-sm">{s.name}</span>
            )}
            <span className="text-[10px] font-bold tracking-widest text-navy/40 mt-1">{s.tier?.toUpperCase()}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default SponsorStrip;
