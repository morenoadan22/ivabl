import { NavLink, Link } from "react-router-dom";

const nav = [
  { to: "/", label: "Schedule", end: true },
  { to: "/standings", label: "Standings" },
  { to: "/statistics", label: "Statistics" },
  { to: "/live", label: "Live" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/rules", label: "Rules" },
  { to: "/locations", label: "Locations" },
  { to: "/tryouts", label: "Tryouts • $10" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Tryouts announcement — sitewide (from flyer) */}
      <div className="bg-amber-300 text-navy text-[12px] sm:text-[13px] font-semibold">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-navy text-amber-300 text-[10px] font-black">!</span>
            <span className="font-black tracking-wide">TRYOUTS — $10</span>
            <span className="hidden sm:inline font-medium text-navy/70">Oct 17 • 9–11 AM</span>
            <span className="hidden lg:inline font-medium text-navy/70">• Sunflower Field</span>
            <span className="hidden xl:inline font-medium text-navy/50">• $10 → $50 team fee if selected</span>
          </span>
          <Link to="/tryouts" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-navy text-white text-xs font-black hover:bg-navy-deep transition shrink-0">
            Sign up & pay →
          </Link>
        </div>
      </div>
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur bg-navy-deep/90 border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/img/league_logo.jpeg" alt="IV Men's League" className="h-10 w-10 rounded-lg object-cover bg-cream p-0.5 shadow" />
            <div className="hidden sm:block leading-tight">
              <div className="font-display font-black text-white text-[15px] tracking-tight">IV MEN'S LEAGUE</div>
              <div className="text-[11px] font-semibold tracking-[0.14em] text-gold">2026 SUMMER • WOOD BAT</div>
            </div>
            <div className="sm:hidden font-display font-black text-white text-[15px]">IV MEN'S</div>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {nav.map(n => {
              const isLive = n.to === "/live";
              const isTryouts = n.to === "/tryouts";
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition ${
                      isActive
                        ? isTryouts
                          ? "bg-amber-300 text-navy shadow"
                          : "bg-white text-navy shadow"
                        : isTryouts
                          ? "bg-amber-300/90 text-navy hover:bg-amber-300 shadow-sm"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                    } ${isLive && !isActive ? "ring-1 ring-red-500/30" : ""}`
                  }
                >
                  {isLive && <span className="h-2 w-2 rounded-full bg-red-500 shadow shadow-red-500/30" />}
                  {isTryouts && !n.label.includes("•") && <span className="h-1.5 w-1.5 rounded-full bg-navy/60" />}
                  {n.label}
                </NavLink>
              );
            })}
          </nav>

          <a href="https://www.facebook.com/groups/538464853381722" target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white">
            <img src="/facebook-icon.png" alt="" className="h-4 w-4 opacity-90" />
            Facebook
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-navy-deep">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm">
          <div className="text-white/60">© 2026 Imperial Valley Men's Baseball League • Wood bat. No exceptions.</div>
          <div className="flex items-center gap-4">
            <a href="mailto:info@ivabl.com" className="text-gold hover:text-white transition">info@ivabl.com</a>
            <a href="https://www.facebook.com/groups/538464853381722" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white">
              <img src="/facebook-icon.png" alt="" className="h-4 w-4" /> Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
