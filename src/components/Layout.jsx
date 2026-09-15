import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const primaryNav = [
  { to: "/", label: "Schedule", end: true },
  { to: "/standings", label: "Standings" },
  { to: "/statistics", label: "Statistics" },
  { to: "/live", label: "Live" },
];
const moreNav = [
  { to: "/sponsors", label: "Sponsors" },
  { to: "/rules", label: "Rules" },
  { to: "/locations", label: "Locations" },
  { to: "/past-seasons", label: "Past Seasons" },
];
const tryoutsLink = { to: "/tryouts", label: "Tryouts • $10" };
const FACEBOOK_URL = "https://www.facebook.com/groups/538464853381722";

const pillBase = "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition";
const pillIdle = "text-white/70 hover:text-white hover:bg-white/10";
const pillActive = "bg-white text-navy shadow";
const pillTryouts = "bg-amber-300 text-navy hover:bg-amber-200 shadow-sm";

function LiveDot() {
  return <span className="h-2 w-2 rounded-full bg-red-500 shadow shadow-red-500/30" />;
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef(null);

  const moreActive = moreNav.some((n) => n.to === pathname);

  // Close menus on navigation
  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close "More" on outside click / Escape
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

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
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/img/league_logo.jpeg" alt="IV Men's League" className="h-10 w-10 rounded-lg object-cover bg-cream p-0.5 shadow" />
            <div className="hidden sm:block leading-tight">
              <div className="font-display font-black text-white text-[15px] tracking-tight">IV MEN'S LEAGUE</div>
              <div className="text-[11px] font-semibold tracking-[0.14em] text-gold">2026 FALL/WINTER • WOOD BAT</div>
            </div>
            <div className="sm:hidden font-display font-black text-white text-[15px]">IV MEN'S</div>
          </Link>

          {/* Desktop nav — no scrolling, overflow lives in "More" */}
          <div className="hidden lg:flex items-center gap-2 min-w-0">
            <nav className="flex items-center gap-1">
              {primaryNav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) => `${pillBase} ${isActive ? pillActive : pillIdle}`}
                >
                  {n.to === "/live" && <LiveDot />}
                  {n.label}
                </NavLink>
              ))}
              <div ref={moreRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  className={`${pillBase} ${moreActive ? pillActive : pillIdle}`}
                >
                  More
                  <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {moreOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-navy-deep border border-white/10 shadow-xl shadow-black/30 p-1.5">
                    {moreNav.map((n) => (
                      <NavLink
                        key={n.to}
                        to={n.to}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-lg text-[13px] font-semibold transition ${
                            isActive ? "bg-white text-navy" : "text-white/75 hover:text-white hover:bg-white/10"
                          }`
                        }
                      >
                        {n.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>
            {/* Pinned CTA — never scrolls out of view */}
            <NavLink to={tryoutsLink.to} className={`${pillBase} ${pillTryouts}`}>
              {tryoutsLink.label}
            </NavLink>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook group" title="Facebook group" className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition shrink-0">
              <img src="/facebook-icon.png" alt="" className="h-4 w-4 opacity-90" />
            </a>
          </div>

          {/* Tablet/mobile — pinned CTA + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <NavLink to={tryoutsLink.to} className="inline-flex items-center px-3.5 py-2 rounded-full bg-amber-300 text-navy text-[13px] font-bold hover:bg-amber-200 transition whitespace-nowrap shadow-sm">
              {tryoutsLink.label}
            </NavLink>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 5.5h14M3 10h14M3 14.5h14" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-white/10 px-4 sm:px-6 py-3 space-y-1">
            {[...primaryNav, ...moreNav].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isActive ? "bg-white text-navy" : "text-white/75 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {n.to === "/live" && <LiveDot />}
                {n.label}
              </NavLink>
            ))}
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-white/75 hover:text-white hover:bg-white/10 transition">
              <img src="/facebook-icon.png" alt="" className="h-4 w-4 opacity-90" /> Facebook
            </a>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-navy-deep">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm">
          <div className="text-white/60">© 2026 Imperial Valley Men's Baseball League • Wood bat. No exceptions.</div>
          <div className="flex items-center gap-4">
            <a href="mailto:info@ivabl.com" className="text-gold hover:text-white transition">info@ivabl.com</a>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white">
              <img src="/facebook-icon.png" alt="" className="h-4 w-4" /> Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
