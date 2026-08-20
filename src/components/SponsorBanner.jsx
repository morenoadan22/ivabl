import { Link } from "react-router-dom";
import { sponsors } from "../data/sponsors.js";

export function SponsorStrip({ compact = false, className = "" }) {
  if (sponsors.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-gold/40 bg-cream/40 ${compact ? "p-3" : "p-4 sm:p-5"} ${className}`}>
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
    <div className={`rounded-xl bg-white ring-1 ring-black/5 overflow-hidden flex flex-col h-full ${className} ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-[11px] font-black tracking-[0.16em] text-navy/50">OUR SPONSORS</span>
        <Link to="/sponsors" className="text-xs font-bold text-navy/60 hover:text-navy">View all →</Link>
      </div>
      <div className={`flex flex-wrap gap-3 items-stretch content-start flex-1 ${compact ? "justify-start sm:justify-center" : "justify-center"}`}>
        {sponsors.map(s => {
          const img = s.banner || s.logo;
          return (
            <a
              key={s.name}
              href={s.url || "/sponsors"}
              target={s.url ? "_blank" : undefined}
              rel={s.url ? "noreferrer" : undefined}
              className={`rounded-xl border overflow-hidden hover:shadow-md transition bg-white w-full ${compact ? "max-w-[380px]" : "max-w-[420px] sm:w-[calc(50%-12px)]"} ${s.tier === "Gold" ? "ring-1 ring-gold/40 border-gold/40" : "border-black/5"} flex flex-col`}
            >
              {img ? (
                <div className={`bg-white flex items-center justify-center overflow-hidden shrink-0 ${compact ? "h-[88px] sm:h-[96px]" : "h-[110px] sm:h-[128px]"}`}>
                  <img src={img} alt={s.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className={`flex items-center justify-center p-6 text-center font-display font-bold text-navy shrink-0 ${compact ? "h-[88px] sm:h-[96px]" : "h-[110px] sm:h-[128px]"}`}>{s.name}</div>
              )}
              <div className="px-3 py-2 bg-cream/40 border-t flex items-center justify-between mt-auto min-h-[36px]">
                <span className="text-xs font-bold text-navy truncate">{s.name}</span>
                <span className="text-[10px] font-black tracking-widest text-navy/50 shrink-0 ml-2">{s.tier?.toUpperCase()}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default SponsorStrip;
