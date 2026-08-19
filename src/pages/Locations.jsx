import { locationMaps } from "../data/teams.js";

const fields = [
  { id: "stark", name: "Stark Field", address: "830 S 4th St, El Centro, CA 92243", note: "Primary El Centro diamond" },
  { id: "sunflower", name: "Sunflower Park", address: "Sunflower Park Baseball Field, El Centro", note: "North El Centro" },
  { id: "calexico", name: "Calexico High School", address: "1030 Encinas Ave, Calexico, CA 92231", note: "Calexico HS" },
  { id: "central", name: "Central Union HS", address: "1001 W Brighton Ave, El Centro, CA 92243", note: "Central High" },
  { id: "brawley", name: "Wiest Field", address: "1044 Magnolia St, Brawley, CA 92227", note: "Brawley" },
];

export default function Locations() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-6 border-b bg-gradient-to-r from-navy to-navy-mid">
          <h1 className="font-display font-black text-white text-[22px]">Fields & Locations</h1>
          <p className="text-white/70 text-sm mt-1">All games 7:00 PM • Click map for directions</p>
        </div>
        <div className="p-4 sm:p-6 grid gap-6">
          {fields.map(f=>(
            <section key={f.id} id={f.id} className="rounded-2xl border border-black/5 overflow-hidden bg-white shadow-sm scroll-mt-20">
              <div className="px-5 py-4 flex flex-wrap gap-2 items-baseline justify-between bg-cream/50 border-b">
                <h2 className="font-display font-bold text-navy text-lg">{f.name}</h2>
                <span className="text-xs font-medium text-navy/60">{f.address} • {f.note}</span>
              </div>
              <div className="aspect-[16/9] sm:aspect-[2.2/1] bg-navy/5">
                <iframe
                  title={f.name}
                  src={locationMaps[f.id]}
                  width="100%" height="100%" style={{border:0}} loading="lazy" allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
