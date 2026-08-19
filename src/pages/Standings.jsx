import { Link } from "react-router-dom";
import { schedule, mapTeamNameToPage } from "../data/schedule.js";
import { computeStandings } from "../utils/standings.js";
import { getTeamByName } from "../data/teams.js";

export default function Standings() {
  const rows = computeStandings(schedule);
  const PLAYOFF_CUTOFF = 5;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-navy to-navy-mid">
          <h1 className="font-display font-black text-white text-[22px] tracking-tight">Standings</h1>
          <p className="text-white/70 text-sm mt-1">Top {PLAYOFF_CUTOFF} qualify for playoffs • PCT = (W + D/3) / G • No playoff games counted</p>
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
                <th className="text-center px-3 py-3">RS</th>
                <th className="text-center px-3 py-3">RA</th>
                <th className="text-center px-3 py-3">RD</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const isPlayoff = r.rank <= PLAYOFF_CUTOFF;
                const isCutoff = r.rank === PLAYOFF_CUTOFF;
                const team = getTeamByName(r.name);
                return (
                  <tr key={r.name} className={`border-b last:border-0 ${isPlayoff ? "bg-white" : "bg-white/60"} ${isCutoff ? "border-b-2 border-amber-300" : "border-black/5"} hover:bg-cream/50`}>
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-black px-1.5 ${isPlayoff ? "bg-navy text-white" : "bg-navy/10 text-navy/60"}`}>{r.rank}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/team/${mapTeamNameToPage(r.name)}`} className="flex items-center gap-2.5 group">
                        {team?.image && <img src={team.image} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-black/10" />}
                        <span className="font-bold text-navy group-hover:underline underline-offset-2">{r.name}</span>
                        {isPlayoff && <span className="text-[10px] font-bold tracking-widest bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">PLAYOFF</span>}
                      </Link>
                    </td>
                    <td className="text-center font-semibold">{r.wins}</td>
                    <td className="text-center text-navy/70">{r.losses}</td>
                    <td className="text-center text-navy/70">{r.draws}</td>
                    <td className="text-center font-mono font-semibold">{r.pct.toFixed(3)}</td>
                    <td className="text-center">{r.rs}</td>
                    <td className="text-center text-navy/60">{r.ra}</td>
                    <td className={`text-center font-bold ${r.rd > 0 ? "text-emerald-700" : r.rd < 0 ? "text-red-600" : "text-navy/50"}`}>{r.rd > 0 ? `+${r.rd}` : r.rd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-amber-50 border-t border-amber-200 flex items-center gap-2 text-sm">
          <span className="text-lg">🏆</span>
          <span className="font-semibold text-amber-900">Top {PLAYOFF_CUTOFF} teams qualify for playoffs</span>
          <span className="text-amber-700 hidden sm:inline">• Cutoff highlighted above</span>
        </div>
      </div>
    </div>
  );
}
