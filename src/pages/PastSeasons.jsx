import { Link } from "react-router-dom";
import { schedule as summerSchedule } from "../data/archive/summer2026Schedule.js";
import { teams as summerTeams } from "../data/archive/summer2026Teams.js";
import { isPlayoffWeek } from "../data/schedule.js";
import { computeStandings } from "../utils/standings.js";

const SUMMER_2026 = {
  label: "Summer 2026",
  meta: "7 teams • June – August • Calexico, Stark, Brawley, Holtville",
  champion: "Aztecas",
  championNote: "3rd straight tournament title",
  championImage: "/img/team/aztecas_champs_3x.jpeg",
  statsCsv: "/archive/summer-2026-stats.csv",
};

function teamImage(name) {
  return summerTeams.find((t) => t.name === name)?.image;
}

export default function PastSeasons() {
  const rows = computeStandings(summerSchedule);
  const playoffWeeks = summerSchedule.filter(isPlayoffWeek);
  const finalWeek = summerSchedule.find((w) => w.week === "Final");
  const finalGame = finalWeek?.games?.[0];
  const finalWinner =
    finalGame?.result == null
      ? null
      : finalGame.result.away > finalGame.result.home
        ? finalGame.away
        : finalGame.result.home > finalGame.result.away
          ? finalGame.home
          : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-navy to-navy-mid">
          <div className="text-[11px] font-black tracking-[0.16em] text-gold">ARCHIVE</div>
          <h1 className="font-display font-black text-white text-[22px] tracking-tight">Past Seasons</h1>
          <p className="text-white/70 text-sm mt-1">Final standings, champions & stats from completed IVABL seasons.</p>
        </div>
      </div>

      {/* Summer 2026 */}
      <div className="rounded-[20px] overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-deep shadow-xl shadow-black/20 ring-1 ring-amber-200/30">
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-0">
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.18em] text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-300" /> {SUMMER_2026.label.toUpperCase()} CHAMPIONS
            </div>
            <h2 className="font-display font-black text-[28px] sm:text-[36px] leading-none tracking-[-0.02em] text-white mt-3">
              {SUMMER_2026.champion}<br />
              <span className="text-amber-300">3X Champions</span>
            </h2>
            <p className="text-[13px] leading-6 text-white/70 mt-3 max-w-[460px]">
              The Aztecas bested the Arabes <span className="text-white font-bold">2-1</span> in a well-played
              championship on Sunday, Aug 23 at Calexico — their{" "}
              <span className="text-amber-300 font-bold">third straight</span> tournament title.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest bg-amber-300 text-navy px-3 py-1.5 rounded-full">2026 CHAMPS</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-white border border-white/15 px-3 py-1.5 rounded-full">Final: AZT 2 - ARA 1</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-white border border-white/15 px-3 py-1.5 rounded-full">{SUMMER_2026.meta}</span>
            </div>
            <div className="flex gap-2 mt-5 flex-wrap">
              <a href={SUMMER_2026.statsCsv} download className="px-5 py-2.5 rounded-full bg-amber-300 text-navy text-sm font-black hover:bg-amber-200 transition inline-flex items-center justify-center">Download stats (CSV)</a>
              <Link to="/tryouts" className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition inline-flex items-center justify-center">Fall/Winter tryouts</Link>
            </div>
          </div>
          <div className="relative bg-black/20 flex flex-col">
            <img
              src={SUMMER_2026.championImage}
              alt="Aztecas 2026 Summer Champions — team with trophy, third straight title"
              className="w-full h-[280px] sm:h-[360px] md:h-full object-cover"
              loading="eager"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-[11px] font-black tracking-[0.14em] text-amber-300 text-center">AZTECAS - 2-1 OVER ARABES - AUG 23, 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final standings */}
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b bg-cream/40 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-black text-navy text-lg">Summer 2026 — Final Standings</h2>
          <span className="text-[11px] font-bold tracking-widest text-navy/50">PLAYOFF GAMES EXCLUDED</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] tracking-widest font-bold text-navy/60 border-b bg-cream/60">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">TEAM</th>
                <th className="text-center px-3 py-3">W</th>
                <th className="text-center px-3 py-3">L</th>
                <th className="text-center px-3 py-3">D</th>
                <th className="text-center px-3 py-3">PCT</th>
                <th className="text-center px-3 py-3">RD</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const img = teamImage(r.name);
                return (
                  <tr key={r.name} className="border-b last:border-0 border-black/5 hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-black px-1.5 bg-navy/10 text-navy/60">{r.rank}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        {img && <img src={img} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-black/10" />}
                        <span className="font-bold text-navy">{r.name}</span>
                        {r.name === SUMMER_2026.champion && (
                          <span className="text-[10px] font-bold tracking-widest bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">CHAMPS</span>
                        )}
                      </span>
                    </td>
                    <td className="text-center font-semibold">{r.wins}</td>
                    <td className="text-center text-navy/70">{r.losses}</td>
                    <td className="text-center text-navy/70">{r.draws}</td>
                    <td className="text-center font-mono font-semibold">{r.pct.toFixed(3)}</td>
                    <td className={`text-center font-bold ${r.rd > 0 ? "text-emerald-700" : r.rd < 0 ? "text-red-600" : "text-navy/50"}`}>{r.rd > 0 ? `+${r.rd}` : r.rd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Playoffs */}
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b bg-cream/40">
          <h2 className="font-display font-black text-navy text-lg">Summer 2026 — Playoffs</h2>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          {playoffWeeks.map((week, wi) => (
            <div key={`${week.week}-${wi}`}>
              <div className="text-[11px] font-black tracking-[0.16em] text-brick mb-2">{String(week.week).toUpperCase()}</div>
              <div className="grid gap-2">
                {week.games.map((g, gi) => (
                  <div key={gi} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-black/5 px-4 py-2.5 text-sm">
                    <span className="font-bold text-navy">{g.away} {g.result ? g.result.away : ""}</span>
                    <span className="text-navy/40">@</span>
                    <span className="font-bold text-navy">{g.home} {g.result ? g.result.home : ""}</span>
                    <span className="text-xs text-navy/50">{g.date} • {g.location}</span>
                    {g.description && <span className="text-xs font-semibold text-brick">{g.description}</span>}
                    {finalGame === g && finalWinner && (
                      <span className="text-[10px] font-bold tracking-widest bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">CHAMPIONSHIP</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teams strip */}
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b bg-cream/40">
          <h2 className="font-display font-black text-navy text-lg">Summer 2026 — Teams</h2>
        </div>
        <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summerTeams.map((t) => (
            <div key={t.slug} className="rounded-xl border border-black/5 overflow-hidden">
              <img src={t.image} alt={t.name} className="w-full h-24 object-cover" loading="lazy" />
              <div className="px-3 py-2 text-sm font-bold text-navy">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
