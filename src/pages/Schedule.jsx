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
    <div className="leading-snug text-[13px] min-w-0 break-words">
      <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1">
        <span className="text-navy/50 font-medium shrink-0">{game.date}</span>
        <span className="inline-flex flex-wrap items-baseline gap-x-1 min-w-0">
          <TeamLink name={game.away} scorePrefix={awayPrefix} isWinner={awayWin} isLoser={homeWin} isTie={isTie} />
          <span className="text-navy/40">vs.</span>
          <TeamLink name={game.home} scorePrefix={homePrefix} isWinner={homeWin} isLoser={awayWin} isTie={isTie} />
        </span>
        <Link to="/locations" className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-navy/5 text-navy/70 hover:bg-navy hover:text-white transition shrink-0">@{game.location}</Link>
      </div>
      {game.description && <div className="text-[11px] text-brick font-medium mt-1.5 leading-tight break-words whitespace-normal">{game.description}</div>}
    </div>
  );
}

export default function Schedule() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
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

      {/* Schedule — Week Cards (Mon-Sun) */}
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-navy to-navy-mid flex flex-wrap gap-3 items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg">Schedule • Mon — Sun</h2>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Winner</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-red-400" /> Loss</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-amber-300" /> Tie</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 bg-cream/20">
          {schedule.map((week, wi) => {
            const isPlayoff = isPlayoffWeek(week);
            const showPlayoffHeader = isPlayoff && wi > 0 && !isPlayoffWeek(schedule[wi - 1]);
            const hasGames = week.games.length > 0;
            return (
              <div key={wi}>
                {showPlayoffHeader && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-amber-200" />
                    <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black tracking-[0.16em]">🏆 PLAYOFFS</span>
                    <span className="h-px flex-1 bg-amber-200" />
                  </div>
                )}
                <div className={`rounded-2xl overflow-hidden ring-1 shadow-sm ${isPlayoff ? "ring-amber-200 bg-amber-50/30" : "ring-black/5 bg-white"}`}>
                  <div className={`px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 ${isPlayoff ? "bg-navy text-white" : "bg-navy text-white/95"}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full text-xs font-black ${isPlayoff ? "bg-amber-300 text-navy" : "bg-white text-navy"}`}>
                        {typeof week.week === "number" ? week.week : "P"}
                      </span>
                      <span className="font-display font-bold text-sm sm:text-[15px]">
                        {isPlayoff ? week.week : `Week ${week.week}`}
                      </span>
                      {isPlayoff && <span className="text-[11px] font-bold tracking-widest text-amber-200">PLAYOFF</span>}
                    </div>
                    <span className="text-xs font-medium text-white/70">
                      {week.games.length} {week.games.length === 1 ? "game" : "games"}
                      {hasGames && ` • ${[...new Set(week.games.map(g=>g.dayOfWeek))].join(" • ")}`}
                    </span>
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
                      {days.map(day => {
                        const games = week.games.filter(g => g.dayOfWeek === day);
                        const isEmpty = games.length === 0;
                        return (
                          <div
                            key={day}
                            className={`rounded-xl border p-2.5 flex-col min-h-[84px] min-w-0 overflow-hidden ${
                              isEmpty
                                ? "hidden lg:flex bg-black/[0.02] border-dashed border-black/10"
                                : "flex bg-white border-black/5 shadow-sm"
                            }`}
                          >
                            <div className={`text-[11px] font-black tracking-widest mb-1.5 ${isEmpty ? "text-navy/30" : "text-navy/50"}`}>
                              <span>{day.slice(0, 3).toUpperCase()}</span>
                            </div>
                            {isEmpty ? (
                              <span className="text-xs text-navy/20 mt-1">—</span>
                            ) : (
                              <div className="space-y-0 divide-y divide-black/5">
                                {games.map((g, idx) => (
                                  <div key={idx} className={idx === 0 ? "pb-2" : "py-2 last:pb-0"}>
                                    <GameLine game={g} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Handle any games with non-standard day (fallback) */}
                    {week.games.filter(g => !days.includes(g.dayOfWeek)).length > 0 && (
                      <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                        <div className="text-[11px] font-black tracking-widest text-amber-800 mb-1">OTHER</div>
                        <div className="space-y-2">
                          {week.games.filter(g => !days.includes(g.dayOfWeek)).map((g, idx) => (
                            <GameLine key={`other-${idx}`} game={g} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
