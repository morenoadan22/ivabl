export default function Rules() {
  const rules = [
    { title: "First pitch 7:00 PM", desc: "All games start at 7:00 PM sharp. Arrive early for warmups and lineup exchange." },
    { title: "8-game regular season", desc: "Each team plays 8 games before playoffs." },
    { title: "Wood bats — NO EXCEPTIONS", desc: "Composite and metal bats are not permitted. Bring your own wood bats." },
    { title: "Home team keeps book", desc: "Home team is responsible for GameChanger scoring and setting lineups (Away vs. Home)." },
    { title: "9 innings or 2.5 hours", desc: "No new inning after the time limit." },
    { title: "Top 5 → playoffs", desc: "Top five teams by standings qualify." },
    { title: "3-game eligibility", desc: "Players need 3 regular-season games to be playoff-eligible." },
    { title: "Roster lock", desc: "Playoff rosters are locked after the final regular-season game." },
    { title: "Respect the field", desc: "No tobacco or alcohol is permitted on the field. Leave it cleaner than you found it." },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-6 border-b bg-gradient-to-r from-navy to-navy-mid">
          <h1 className="font-display font-black text-white text-[22px]">League Rules</h1>
          <p className="text-white/70 text-sm mt-1">Please read before game day • Questions? <a href="mailto:morenoadan22@gmail.com" className="underline text-gold">morenoadan22@gmail.com</a></p>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {rules.map(r=>(
            <div key={r.title} className="rounded-xl border border-gold-muted/40 bg-cream/40 p-4">
              <div className="text-sm font-black tracking-tight text-navy">{r.title}</div>
              <div className="text-sm text-navy/70 mt-1 leading-6">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
