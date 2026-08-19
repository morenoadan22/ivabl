import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { schedule, mapTeamNameToPage } from "../data/schedule.js";
import { getTeamBySlug } from "../data/teams.js";
import rosters from "../data/rosters.json";

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

export default function TeamPage() {
  const { slug } = useParams();
  const team = getTeamBySlug(slug);
  const teamName = team?.name;
  const roster = teamName ? (rosters[teamName] || rosters[teamName.replace('Los Gringos','Los Grignos')] || []) : [];
  // handle typo in rosters.json
  const effectiveRoster = roster.length ? roster : (slug==='los_gringos' ? (rosters["Los Grignos"]||[]) : roster);

  const games = teamName ? schedule.flatMap(w=> w.games.filter(g=> g.home===teamName || g.away===teamName).map(g=> ({...g, week:w.week}))) : [];

  const [statsMap, setStatsMap] = useState({});

  useEffect(()=>{
    if(!teamName) return;
    fetch("/stats.csv").then(r=> r.text()).then(csv=>{
      setStatsMap(parseStatsForTeam(csv, teamName));
    }).catch(()=>{});
  },[teamName]);

  if(!team){
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <div className="text-navy font-bold">Team not found</div>
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
            {team.manager && <div className="text-white/80 text-sm mt-1">Manager: {team.managerUrl ? <a href={team.managerUrl} target="_blank" rel="noreferrer" className="underline text-gold">{team.manager}</a> : team.manager}</div>}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/70">
            <span className="px-3 py-1.5 rounded-full bg-white/15">2026 SUMMER</span>
            <span className="px-3 py-1.5 rounded-full bg-gold text-navy">WOOD BAT</span>
          </div>
        </div>

        <div className="p-6 flex justify-center bg-cream/40">
          <img src={team.image} alt={`${team.name} logo`} className="w-full max-w-[320px] rounded-2xl shadow bg-white object-cover aspect-[4/3]" />
        </div>

        <div className="px-6 py-6">
          <h2 className="font-display font-bold text-navy text-lg mb-3">Games</h2>
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white text-xs tracking-widest">
                <tr><th className="text-left px-3 py-2">Week</th><th className="text-left px-3 py-2">Date</th><th className="text-left px-3 py-2">Opponent</th><th className="text-left px-3 py-2">Location</th><th className="text-left px-3 py-2">Result</th></tr>
              </thead>
              <tbody>
                {games.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-navy/50">No games found.</td></tr>}
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
                      <td className="px-3 py-2"><span className="text-navy/60 mr-1">{isHome?"vs.":"@"}</span><Link to={`/team/${mapTeamNameToPage(opp)}`} className="font-semibold text-navy hover:underline">{opp}</Link></td>
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
