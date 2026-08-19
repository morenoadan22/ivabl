import { Link } from "react-router-dom";
import { schedule, mapTeamNameToPage, isPlayoffWeek, isSeededPlaceholder } from "../data/schedule.js";
import { getTeamByName } from "../data/teams.js";
import GameChangerWidget from "../components/GameChangerWidget.jsx";

function TeamLink({ name, scorePrefix, isWinner, isLoser, isTie }) {
  if (isSeededPlaceholder(name)) {
    const isWinnerSeed = /^Winner/i.test(name);
    return (
      <span className={isWinnerSeed ? "font-semibold text-navy border border-gold bg-cream px-1.5 py-0.5 rounded text-xs" : "italic text-navy/60 text-xs"} title={name}>
        {scorePrefix}{name}
      </span>
    );
  }
  const color = isWinner ? "text-emerald-700 font-semibold" : isLoser ? "text-red-600" : isTie ? "text-amber-600 font-medium" : "text-navy";
  const team = getTeamByName(name);
  return (
    <Link to={`/team/${mapTeamNameToPage(name)}`} className={`hover:underline underline-offset-2 ${color}`}>
      {scorePrefix}{name}
    </Link>
  );
}

function GameLine({ game }) {
  const hs = game.result?.home;
  const as = game.result?.away;
  const hasResult = hs !== undefined && as !== undefined;
  const isTie = hasResult && hs === as;
  const homeWin = hasResult && hs > as;
  const awayWin = hasResult && hs < as;
  const homePrefix = hasResult ? `${hs} – ` : "";
  const awayPrefix = hasResult ? `${as} – ` : "";

  return (
    <div className="leading-snug text-[13px]">
      <span className="text-navy/50 font-medium mr-1.5">{game.date}</span>
      <TeamLink name={game.away} scorePrefix={awayPrefix} isWinner={awayWin} isLoser={homeWin} isTie={isTie} />
      <span className="mx-1 text-navy/40">vs.</span>
      <TeamLink name={game.home} scorePrefix={homePrefix} isWinner={homeWin} isLoser={awayWin} isTie={isTie} />
      <Link to="/locations" className="ml-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-navy/5 text-navy/70 hover:bg-navy hover:text-white transition">@{game.location}</Link>
      {game.description && <div className="text-[11px] text-brick font-medium mt-0.5">{game.description}</div>}
    </div>
  );
}

export default function Schedule() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-[20px] overflow-hidden bg-white shadow-xl shadow-black/20 ring-1 ring-black/5">
        <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-0">
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-brick">
              <span className="h-2 w-2 rounded-full bg-brick animate-pulse" /> IMPERIAL VALLEY • SUMMER 2026
            </div>
            <h1 className="font-display font-black text-[30px] sm:text-[38px] leading-none tracking-[-0.03em] text-navy mt-2">
              IVABL<br />
              <span className="text-navy/30">Summer Season 2026</span>
            </h1>
            <p className="text-[14px] leading-6 text-navy/70 mt-3 max-w-[520px]">
              Seven teams. Nine innings or 2.5 hours. All games at 7:00 PM. Home team keeps score + GameChanger lineups.
              <strong className="text-navy"> No tobacco or alcohol on the field.</strong>
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs font-semibold bg-cream border border-gold-muted text-navy px-3 py-1.5 rounded-full">7:00 PM starts</span>
              <span className="text-xs font-semibold bg-cream border border-gold-muted text-navy px-3 py-1.5 rounded-full">5 of 7 → playoffs</span>
              <span className="text-xs font-semibold bg-cream border border-gold-muted text-navy px-3 py-1.5 rounded-full">3-game eligibility</span>
            </div>
            <div className="flex gap-2 mt-5">
              <Link to="/standings" className="px-4 py-2 rounded-full bg-navy text-white text-sm font-semibold hover:bg-navy-deep transition">View standings</Link>
              <Link to="/locations" className="px-4 py-2 rounded-full bg-white border border-navy/15 text-navy text-sm font-semibold hover:bg-cream transition">Fields & maps</Link>
            </div>
          </div>
          <div className="bg-cream border-t md:border-t-0 md:border-l border-gold-muted/60 p-6 flex flex-col items-center justify-center gap-4">
            <img src="/img/league_logo.jpeg" alt="League logo" className="w-full max-w-[260px] rounded-2xl shadow-lg bg-white p-3" />
            <p className="text-xs font-semibold text-navy/60 text-center">Imperial Valley’s wood-bat league — since 2026</p>
          </div>
        </div>
      </div>

      {/* GameChanger Live Scoreboard */}
      <GameChangerWidget />

      {/* Schedule table */}
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-navy to-navy-mid flex flex-wrap gap-3 items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg">Schedule</h2>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Winner</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-red-400" /> Loss</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-amber-300" /> Tie</span>
          </div>
        </div>

        {/* Mobile: week cards */}
        <div className="md:hidden divide-y">
          {schedule.map((week, wi) => {
            const isPlayoff = isPlayoffWeek(week);
            return (
              <div key={wi} className={isPlayoff ? "bg-amber-50/60" : ""}>
                {isPlayoff && wi > 0 && !isPlayoffWeek(schedule[wi - 1]) && (
                  <div className="px-4 py-2 bg-amber-100 border-y border-amber-200 text-xs font-black tracking-widest text-amber-900">🏆 PLAYOFFS</div>
                )}
                <div className={`px-4 py-3 flex items-center justify-between ${isPlayoff ? "bg-navy text-white" : "bg-cream"}`}>
                  <span className={`text-xs font-black tracking-widest ${isPlayoff ? "text-amber-200" : "text-navy/60"}`}>WEEK {week.week}</span>
                  <span className={`text-sm font-bold ${isPlayoff ? "text-white" : "text-navy"}`}>{isPlayoff ? week.week : `Week ${week.week}`}</span>
                </div>
                <div className="p-3 space-y-3">
                  {days.map(day => {
                    const games = week.games.filter(g => g.dayOfWeek === day);
                    if (!games.length) return null;
                    return (
                      <div key={day} className="rounded-xl border border-black/5 bg-white p-3">
                        <div className="text-[11px] font-bold tracking-widest text-navy/50 mb-1.5">{day.toUpperCase()}</div>
                        <div className="space-y-2">
                          {games.map((g, idx) => <GameLine key={idx} game={g} />)}
                        </div>
                      </div>
                    );
                  })}
                  {week.games.filter(g => !days.includes(g.dayOfWeek)).map((g, idx) => (
                    <GameLine key={`other-${idx}`} game={g} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-navy text-white text-xs tracking-widest">
                <th className="text-left font-bold px-3 py-3 w-[90px]">WEEK</th>
                {days.map(d => <th key={d} className="text-left font-bold px-3 py-3">{d.toUpperCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {schedule.map((week, wi) => {
                const isPlayoff = isPlayoffWeek(week);
                const showPlayoffHeader = isPlayoff && wi > 0 && !isPlayoffWeek(schedule[wi - 1]);
                return (
                  <>
                    {showPlayoffHeader && (
                      <tr key={`ph-${wi}`}>
                        <td colSpan={7} className="bg-amber-100 text-amber-900 text-xs font-black tracking-[0.18em] px-3 py-2 border-y border-amber-200">🏆 PLAYOFFS</td>
                      </tr>
                    )}
                    <tr key={wi} className={`border-t ${isPlayoff ? "bg-amber-50/40" : wi % 2 === 0 ? "bg-white" : "bg-cream/40"}`}>
                      <td className={`px-3 py-3 align-top font-black text-xs tracking-widest ${isPlayoff ? "bg-navy text-amber-200" : "bg-navy text-white/90"}`}>
                        {isPlayoff ? week.week : week.week}
                      </td>
                      {days.map(day => {
                        const games = week.games.filter(g => g.dayOfWeek.includes(day));
                        return (
                          <td key={day} className="px-3 py-3 align-top min-w-[150px]">
                            {games.length === 0 ? <span className="text-navy/20">—</span> : (
                              <div className="space-y-2">
                                {games.map((g, idx) => <GameLine key={idx} game={g} />)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
