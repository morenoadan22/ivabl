import { useState } from "react";
import { tiers } from "../data/sponsors.js";
import SponsorBanner from "../components/SponsorBanner.jsx";

export default function Sponsors() {
  const [selectedTier, setSelectedTier] = useState("");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-[20px] overflow-hidden bg-gradient-to-br from-navy via-navy-mid to-navy-deep shadow-xl ring-1 ring-black/10">
        <div className="px-6 sm:px-8 py-10 sm:py-12 text-center">
          <div className="inline-flex px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black tracking-[0.16em]">IVABL • MEN'S BASEBALL LEAGUE</div>
          <h1 className="font-display font-black text-white text-[36px] sm:text-[52px] leading-none tracking-tight mt-3">
            Become a <span className="text-gold">Sponsor</span>
          </h1>
          <p className="text-white/60 text-sm tracking-[0.14em] font-semibold mt-2">IMPERIAL VALLEY ADULT BASEBALL LEAGUE • GROW YOUR BRAND</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="h-px w-16 bg-gold/40" />
            <span className="h-2 w-2 rotate-45 bg-gold" />
            <span className="h-px w-16 bg-gold/40" />
          </div>
        </div>
      </div>

      {/* Current sponsors banner */}
      <SponsorBanner />

      {/* Tiers */}
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b bg-cream/40">
          <h2 className="text-[11px] font-black tracking-[0.2em] text-navy">CHOOSE YOUR SPONSORSHIP TIER</h2>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiers.map(t => (
            <label
              key={t.id}
              className={`rounded-xl border p-4 cursor-pointer transition text-left flex flex-col ${selectedTier === t.name ? "ring-2 border-gold bg-amber-50/50" : "border-black/5 bg-white hover:border-gold/40 hover:shadow"}`}
              style={{ borderTopColor: selectedTier === t.name ? t.color : undefined }}
            >
              <input
                type="radio"
                name="tier"
                value={`${t.name} – ${t.price}`}
                checked={selectedTier === t.name}
                onChange={() => setSelectedTier(t.name)}
                className="sr-only"
              />
              <div className="h-1 w-full rounded-full mb-3" style={{ background: t.color }} />
              <div className="font-display font-black text-navy text-xl tracking-wide">{t.name.toUpperCase()}</div>
              <div className="text-2xl font-bold mt-1" style={{ color: t.color }}>{t.price}</div>
              <ul className="mt-3 space-y-1 text-xs text-navy/60">
                {t.perks.map(p => (
                  <li key={p} className="flex gap-1.5"><span style={{ color: t.color }}>—</span> {p}</li>
                ))}
              </ul>
            </label>
          ))}
        </div>
      </div>

      {/* Form — Formspree (same as ivabl-sponsors.tiiny.site) */}
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <form action="https://formspree.io/f/xwvjleog" method="POST" className="p-4 sm:p-8">
          {/* keep tier sync */}
          <input type="hidden" name="tier" value={selectedTier ? `${selectedTier} – ${tiers.find(t=>t.name===selectedTier)?.price}` : ""} />
          <input type="hidden" name="_subject" value="New IVABL Sponsor Inquiry" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="sm:col-span-2">
              <div className="text-xs font-black tracking-[0.16em] text-red-600 border-b border-red-600/20 pb-2 mb-1">BUSINESS INFORMATION</div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Business / Organization Name *</span>
              <input name="business" required placeholder="Acme Hardware Co." className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Industry</span>
              <select name="industry" defaultValue="" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
                <option value="">Select industry...</option>
                <option>Retail</option>
                <option>Restaurant / Food & Beverage</option>
                <option>Healthcare</option>
                <option>Construction / Trades</option>
                <option>Finance / Insurance</option>
                <option>Real Estate</option>
                <option>Automotive</option>
                <option>Legal</option>
                <option>Technology</option>
                <option>Other</option>
              </select>
            </label>

            <label className="sm:col-span-2 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Business Address</span>
              <input name="address" placeholder="123 Main St, City, State ZIP" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Website</span>
              <input name="website" type="url" placeholder="https://yourbusiness.com" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Social Media Handle</span>
              <input name="social" placeholder="@yourbusiness" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <div className="sm:col-span-2 mt-2">
              <div className="text-xs font-black tracking-[0.16em] text-red-600 border-b border-red-600/20 pb-2 mb-3">PRIMARY CONTACT</div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">First Name *</span>
              <input name="firstname" required placeholder="Jane" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Last Name *</span>
              <input name="lastname" required placeholder="Doe" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Email *</span>
              <input name="email" type="email" required placeholder="jane@business.com" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Phone</span>
              <input name="phone" type="tel" placeholder="(760) 555-0100" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Preferred Contact</span>
              <select name="preferred_contact" defaultValue="" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
                <option value="">Select...</option>
                <option>Email</option>
                <option>Phone</option>
                <option>Either</option>
              </select>
            </label>

            <label className="sm:col-span-2 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Message</span>
              <textarea name="message" rows={4} placeholder="Tell us about your business and why you'd like to sponsor IVABL..." className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold resize-y" />
            </label>

            <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-navy/70">
                <input type="checkbox" name="interest_banner" className="h-4 w-4 rounded border-black/20 text-navy focus:ring-gold" /> Interested in field banner
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-navy/70">
                <input type="checkbox" name="interest_uniform" className="h-4 w-4 rounded border-black/20 text-navy focus:ring-gold" /> Interested in uniform patch
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className="px-7 py-3 rounded-full bg-red-600 text-white font-display font-black tracking-widest text-sm hover:bg-red-700 transition">
              SEND INQUIRY →
            </button>
            <span className="text-xs text-navy/50">Form sends directly to you via Formspree (same as sponsors site). No data stored.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
