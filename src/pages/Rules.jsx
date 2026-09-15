export default function Rules() {
  const rules = [
    { title: "Saturday mornings — 9:00 & 12:30", desc: "Games start at 9:00 AM and 12:30 PM. 15-minute grace period — games begin 9:15 / 12:45 at the latest." },
    { title: "8-game regular season", desc: "Each team plays 8 games before playoffs." },
    { title: "Wood bats — NO EXCEPTIONS", desc: "Composite and metal bats are not permitted. Bring your own wood bats." },
    { title: "Home team keeps book", desc: "Home team is responsible for GameChanger scoring and setting lineups (Away vs. Home)." },
    { title: "9 innings or 2.5 hours", desc: "No new inning after the time limit." },
    { title: "7+ players to start", desc: "Minimum seven players to begin a game. Ghost out the first time through the lineup." },
    { title: "Mercy rule", desc: "15 runs after 5 innings, 10 runs after 7 innings." },
    { title: "Suspended mid-inning", desc: "If a game ends in the middle of an inning, the score reverts to the start of the last completed inning." },
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
          <p className="text-white/70 text-sm mt-1">Please read before game day • Questions? <a href="mailto:info@ivabl.com" className="underline text-gold">info@ivabl.com</a></p>
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
