import { NavLink, Link } from "react-router-dom";

const nav = [
  { to: "/", label: "Schedule", end: true },
  { to: "/standings", label: "Standings" },
  { to: "/statistics", label: "Statistics" },
  { to: "/live", label: "Live" },
  { to: "/rules", label: "Rules" },
  { to: "/locations", label: "Locations" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
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
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition ${
                      isActive ? "bg-white text-navy shadow" : "text-white/70 hover:text-white hover:bg-white/10"
                    } ${isLive && !isActive ? "ring-1 ring-red-500/30" : ""}`
                  }
                >
                  {isLive && <span className="h-2 w-2 rounded-full bg-red-500 shadow shadow-red-500/30" />}
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
            <a href="mailto:morenoadan22@gmail.com" className="text-gold hover:text-white transition">morenoadan22@gmail.com</a>
            <a href="https://www.facebook.com/groups/538464853381722" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white">
              <img src="/facebook-icon.png" alt="" className="h-4 w-4" /> Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
