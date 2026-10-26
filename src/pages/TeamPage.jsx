import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { slugForTeam } from "../utils/games.js";
import { locationMeta } from "../data/teams.js";

function ManagerAvatar({ m }) {
  if (m.image) {
    return <img src={m.image} alt={m.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-gold" />;
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold text-navy text-xs font-black ring-2 ring-white/30" aria-hidden="true">
      {m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
    </span>
  );
}

function ManagerLine({ team }) {
  const managers = [
    { name: team.manager, url: team.managerUrl, image: team.managerImage },
    { name: team.manager2, url: team.manager2Url, image: team.manager2Image },
  ].filter((m) => m.name);
  if (managers.length === 0) return null;
  return (
    <div className="text-white/80 text-sm mt-2 flex items-center gap-2">
      <span className="flex -space-x-2">
        {managers.map((m) => <ManagerAvatar key={m.name} m={m} />)}
      </span>
      <span>
        {managers.length > 1 ? "Managers: " : "Manager: "}
        {managers.map((m, i) => (
          <span key={m.name}>
            {i > 0 && (i === managers.length - 1 ? " & " : ", ")}
            {m.url ? <a href={m.url} target="_blank" rel="noreferrer" className="underline text-gold">{m.name}</a> : m.name}
          </span>
        ))}
      </span>
    </div>
  );
}

function parseStatsForTeam(csvData, teamName) {
  // simplified: use processTeamStats logic from original team_page.js
  function parseLine(line) {
    const res=[]; let cur=''; let inQ=false;
    for(let i=0;i<line.length;i++){
      const c=line[i];
      if(c==='"') inQ=!inQ;
      else if(c===',' && !inQ){ res.push(cur); cur='';}
      else cur+=c;
    }
    res.push(cur); return res;
  }
  const rows = csvData.trim().split('\n');
  const headers = parseLine(rows[0]);
  const map={};
  for(let i=1;i<rows.length;i++){
    const vals=parseLine(rows[i]);
    const pd={};
    headers.forEach((h,idx)=> pd[h.trim()]=(vals[idx]||'').trim());
    if(pd['Team']!==teamName) continue;
    const key=`${pd['First Name']||''} ${pd['Last Name']||''}`.trim().toLowerCase();
    if(!key) continue;
    const gp=parseInt(pd['Games Played'])||0;
    const avg=parseFloat(pd['Batting Average'])||0;
    const h=parseInt(pd['Hits'])||0;
    const hr=parseInt(pd['Home Runs'])||0;
    const rbi=parseInt(pd['Runs Batted In'])||0;
    const ops=parseFloat(pd['On-base Percentage + Slugging Percentage'])||0;
    const d2=parseInt(pd['Doubles'])||0;
    const t3=parseInt(pd['Triples'])||0;
    const era=parseFloat(pd['Earned Run Average']);
    const w=parseInt(pd['Wins'])||0;
    const k=parseInt(pd['Strikeouts'])||0;
    const ip=parseFloat(pd['Innings Pitched'])||0;
    if(!map[key]) map[key]={ gamesPlayed: gp, battingAverage: avg, hits: h, homeRuns: hr, rbi, ops, doubles: d2, triples: t3, era, wins: w, strikeouts: k, inningsPitched: ip };
    else {
      const p=map[key];
      p.gamesPlayed=Math.max(p.gamesPlayed,gp); p.hits+=h; p.homeRuns+=hr; p.rbi+=rbi; p.doubles+=d2; p.triples+=t3; p.wins+=w; p.strikeouts+=k; p.inningsPitched+=ip;
    }
  }
  return map;
}

const SEASON_YEAR = 2026;
const GAME_HOURS = 2;

function parseGameStart(game) {
  if (!game.date || !game.time) return null;
  const [m, d] = game.date.split("/").map(Number);
  const mt = game.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m || !d || !mt) return null;
  let h = Number(mt[1]) % 12;
  if (/pm/i.test(mt[3])) h += 12;
  const start = new Date(SEASON_YEAR, m - 1, d, h, Number(mt[2]), 0);
  if (isNaN(start.getTime())) return null;
  return start;
}

function toStamp(dt) {
  const p = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}${p(dt.getMonth() + 1)}${p(dt.getDate())}T${p(dt.getHours())}${p(dt.getMinutes())}00`;
}

function gameLocation(game) {
  const meta = locationMeta[game.location];
  return meta ? `${meta.name}, ${meta.address}` : game.location;
}

function icsEscape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function gameTitle(game, teamName) {
  const opp = game.home === teamName ? game.away : game.home;
  const vs = game.home === teamName ? "vs." : "@";
  return `${teamName} ${vs} ${opp} (IVABL)`;
}

function googleCalUrl(game, teamName) {
  const start = parseGameStart(game);
  if (!start) return null;
  const end = new Date(start.getTime() + GAME_HOURS * 3600e3);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: gameTitle(game, teamName),
    dates: `${toStamp(start)}/${toStamp(end)}`,
    details: `IVABL Fall/Winter 2026 - Week ${game.week}`,
    location: gameLocation(game),
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

function downloadSeasonICS(games, teamName, slug) {
  const timed = games.map((g) => ({ g, start: parseGameStart(g) })).filter((x) => x.start);
  if (timed.length === 0) return;
  const stamp = toStamp(new Date()).replace(/(\d{4})(\d{2})(\d{2})T/, "$1$2$3T");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IVABL//Schedule//EN"];
  timed.forEach(({ g, start }, i) => {
    const end = new Date(start.getTime() + GAME_HOURS * 3600e3);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${slug}-w${g.week}-${i}@ivabl.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toStamp(start)}`,
      `DTEND:${toStamp(end)}`,
      `SUMMARY:${icsEscape(gameTitle(g, teamName))}`,
      `LOCATION:${icsEscape(gameLocation(g))}`,
      `DESCRIPTION:${icsEscape(`IVABL Fall/Winter 2026 - Week ${g.week}`)}`,
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}-fall-2026.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="12" rx="2" />
      <path d="M1.5 6.5h13M5 1v3M11 1v3" strokeLinecap="round" />
    </svg>
  );
}

export default function TeamPage() {
  const { slug } = useParams();
  const [team, setTeam] = useState(undefined);
  const [teams, setTeams] = useState([]);
  const [effectiveRoster, setEffectiveRoster] = useState([]);
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.seasonTeam(slug).then((d) => {
      setTeam(d.team);
      setEffectiveRoster(d.roster);
      setGames(d.games);
    }).catch(() => setTeam(null));
    api.seasonTeams().then(setTeams).catch(() => {});
  }, [slug]);

  const teamName = team?.name;

  const [statsMap, setStatsMap] = useState({});

  useEffect(()=>{
    if(!teamName) return;
    api.seasonStatsCsv().then(csv=>{
      setStatsMap(parseStatsForTeam(csv, teamName));
    }).catch(()=>{});
  },[teamName]);

  if (team === undefined) {
    return <div className="p-8 text-center text-sm text-white/60">Loading team…</div>;
  }

  if(!team){
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <div className="text-navy font-bold">{error || "Team not found"}</div>
        <Link to="/" className="text-sm text-navy underline">Back to schedule</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
        <span>←</span> Back to League Schedule
      </Link>

      <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
        <div className="bg-gradient-to-r from-navy to-navy-mid px-6 py-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div>
            <h1 className="font-display font-black text-white text-[28px] tracking-tight">⚾ {team.name}</h1>
            <ManagerLine team={team} />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/70">
            <span className="px-3 py-1.5 rounded-full bg-white/15">2026 FALL/WINTER</span>
          </div>
        </div>

        {team.image && (
        <div className="p-6 flex justify-center bg-cream/40">
          <img src={team.image} alt={`${team.name} logo`} className="w-full max-w-[320px] rounded-2xl shadow bg-white object-cover aspect-[4/3]" />
        </div>
        )}

        <div className="px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="font-display font-bold text-navy text-lg">Games</h2>
            {games.some((g) => parseGameStart(g)) && (
              <button
                type="button"
                onClick={() => downloadSeasonICS(games, teamName, slug)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-navy text-white text-xs font-bold hover:bg-navy-deep transition"
                title="Download all games as a calendar file (works with Apple Calendar and Google Calendar)"
              >
                <CalendarIcon /> Add to Calendar
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white text-xs tracking-widest">
                <tr><th className="text-left px-3 py-2">Week</th><th className="text-left px-3 py-2">Date</th><th className="text-left px-3 py-2">Time</th><th className="text-left px-3 py-2">Opponent</th><th className="text-left px-3 py-2">Location</th><th className="text-left px-3 py-2">Result</th></tr>
              </thead>
              <tbody>
                {games.length===0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-navy/50">No games found.</td></tr>}
                {games.map((g, idx)=>{
                  const isHome = g.home===teamName;
                  const opp = isHome ? g.away : g.home;
                  const hs=g.result?.home, as=g.result?.away;
                  let result=null;
                  if(hs!==undefined && as!==undefined){
                    if(hs===as) result=<span className="font-bold text-amber-600">D {hs} – {as}</span>;
                    else {
                      const didWin = (hs>as && isHome) || (as>hs && !isHome);
                      result=<span className={`font-bold ${didWin?"text-emerald-700":"text-red-600"}`}>{didWin?"W":"L"} {hs} – {as}</span>;
                    }
                  }
                  return (
                    <tr key={idx} className="border-t border-black/5 hover:bg-cream/30">
                      <td className="px-3 py-2 font-mono text-xs">{g.week}</td>
                      <td className="px-3 py-2">{g.dayOfWeek} {g.date}</td>
                      <td className="px-3 py-2 font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          {g.time || <span className="text-navy/40">—</span>}
                          {(() => {
                            const url = googleCalUrl(g, teamName);
                            return url ? (
                              <a href={url} target="_blank" rel="noreferrer" title="Add to Google Calendar" className="text-navy/40 hover:text-navy transition">
                                <CalendarIcon />
                              </a>
                            ) : null;
                          })()}
                        </span>
                      </td>
                      <td className="px-3 py-2"><span className="text-navy/60 mr-1">{isHome?"vs.":"@"}</span><Link to={`/team/${slugForTeam(teams, opp)}`} className="font-semibold text-navy hover:underline">{opp}</Link></td>
                      <td className="px-3 py-2"><Link to="/locations" className="text-navy hover:underline">{g.location}</Link></td>
                      <td className="px-3 py-2">{result || <span className="text-navy/40">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 pb-6">
          <h2 className="font-display font-bold text-navy text-lg mb-3">Roster</h2>
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white text-xs tracking-widest">
                <tr>
                  <th className="text-left px-2 py-2">#</th><th className="text-left px-2 py-2">First</th><th className="text-left px-2 py-2">Last</th>
                  <th className="text-center px-2 py-2">GP</th><th className="text-center px-2 py-2">AVG</th><th className="text-center px-2 py-2">H</th><th className="text-center px-2 py-2">2B</th><th className="text-center px-2 py-2">3B</th><th className="text-center px-2 py-2">HR</th><th className="text-center px-2 py-2">RBI</th><th className="text-center px-2 py-2">OPS</th><th className="text-center px-2 py-2">ERA</th><th className="text-center px-2 py-2">W</th><th className="text-center px-2 py-2">K</th>
                </tr>
              </thead>
              <tbody>
                {effectiveRoster.length===0 && <tr><td colSpan={14} className="px-4 py-8 text-center text-navy/50">No roster published yet.</td></tr>}
                {effectiveRoster.map((p, idx)=>{
                  const key=`${p.firstName} ${p.lastName}`.trim().toLowerCase();
                  const s=statsMap[key]||{};
                  return (
                    <tr key={idx} className="border-t border-black/5 hover:bg-cream/30">
                      <td className="px-2 py-2 font-mono text-xs">{p.number || "—"}</td>
                      <td className="px-2 py-2 font-medium">{p.firstName}</td>
                      <td className="px-2 py-2 font-medium">{p.lastName}</td>
                      <td className="text-center px-2 py-2">{s.gamesPlayed||"—"}</td>
                      <td className="text-center px-2 py-2 font-mono">{s.battingAverage? s.battingAverage.toFixed(3):"—"}</td>
                      <td className="text-center px-2 py-2">{s.hits||"—"}</td>
                      <td className="text-center px-2 py-2">{s.doubles||"—"}</td>
                      <td className="text-center px-2 py-2">{s.triples||"—"}</td>
                      <td className="text-center px-2 py-2">{s.homeRuns||"—"}</td>
                      <td className="text-center px-2 py-2">{s.rbi||"—"}</td>
                      <td className="text-center px-2 py-2 font-mono">{s.ops? s.ops.toFixed(3):"—"}</td>
                      <td className="text-center px-2 py-2 font-mono">{!isNaN(s.era) && s.inningsPitched>0 ? s.era.toFixed(2) : "—"}</td>
                      <td className="text-center px-2 py-2">{s.wins||"—"}</td>
                      <td className="text-center px-2 py-2">{s.strikeouts||"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
