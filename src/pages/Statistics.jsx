import { useEffect, useState } from "react";
import { schedule } from "../data/schedule.js";
import { processCSVData, categoryMeta, ITEMS_PER_PAGE } from "../utils/stats.js";

const battingCats = ["battingAverage","qualityAtBats","hits","homeRuns","rbi","ops","doubles"];
const pitchingCats = ["era","wins","strikeouts","whip","baa"];
const labels = {
  battingAverage: "AVG", qualityAtBats: "QAB", hits: "H", homeRuns: "HR", rbi: "RBI", ops: "OPS", doubles: "2B",
  era: "ERA", wins: "W", strikeouts: "K", whip: "WHIP", baa: "BAA",
};

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const max = 5;
  let start = Math.max(1, page - Math.floor(max/2));
  let end = Math.min(totalPages, start + max - 1);
  if (end - start < max - 1) start = Math.max(1, end - max + 1);
  return (
    <div className="flex flex-wrap items-center gap-1.5 justify-center py-3">
      <button disabled={page===1} onClick={()=>onChange(page-1)} className="px-3 py-1.5 rounded-full text-xs font-semibold border disabled:opacity-40 bg-white">« Prev</button>
      {start>1 && <><button onClick={()=>onChange(1)} className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-white">1</button>{start>2 && <span className="text-navy/40">…</span>}</>}
      {Array.from({length: end-start+1}, (_,i)=> i+start).map(n=> (
        <button key={n} onClick={()=>onChange(n)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${n===page ? "bg-navy text-white border-navy" : "bg-white text-navy"}`}>{n}</button>
      ))}
      {end<totalPages && <>{end<totalPages-1 && <span className="text-navy/40">…</span>}<button onClick={()=>onChange(totalPages)} className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-white">{totalPages}</button></>}
      <button disabled={page===totalPages} onClick={()=>onChange(page+1)} className="px-3 py-1.5 rounded-full text-xs font-semibold border disabled:opacity-40 bg-white">Next »</button>
    </div>
  );
}

export default function Statistics() {
  const [mode, setMode] = useState("batting");
  const [category, setCategory] = useState("battingAverage");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(()=>{
    fetch("/stats.csv").then(r=>{
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    }).then(csv=>{
      const parsed = processCSVData(csv, schedule);
      setData(parsed);
    }).catch(e=> setError(e.message));
  },[]);

  useEffect(()=>{
    if(mode==="batting" && !battingCats.includes(category)) { setCategory("battingAverage"); setPage(1); }
    if(mode==="pitching" && !pitchingCats.includes(category)) { setCategory("era"); setPage(1); }
  },[mode, category]);

  const players = data?.[category] || [];
  const totalPages = Math.ceil(players.length / ITEMS_PER_PAGE);
  const slice = players.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);
  const meta = categoryMeta[category];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-navy to-navy-mid flex flex-wrap gap-3 items-center justify-between">
          <h1 className="font-display font-black text-white text-[20px]">Statistics</h1>
          <div className="flex gap-2">
            <button onClick={()=>{setMode("batting"); setPage(1);}} className={`px-4 py-2 rounded-full text-sm font-bold transition ${mode==="batting"?"bg-white text-navy":"bg-white/15 text-white hover:bg-white/25"}`}>Batting</button>
            <button onClick={()=>{setMode("pitching"); setPage(1);}} className={`px-4 py-2 rounded-full text-sm font-bold transition ${mode==="pitching"?"bg-white text-navy":"bg-white/15 text-white hover:bg-white/25"}`}>Pitching</button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 bg-cream/60 border-b flex flex-wrap gap-1.5">
          {(mode==="batting"? battingCats: pitchingCats).map(cat=>(
            <button key={cat} onClick={()=>{setCategory(cat); setPage(1);}} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${category===cat?"bg-navy text-white border-navy":"bg-white text-navy/70 border-black/10 hover:text-navy"}`}>
              {labels[cat]}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 p-4 text-sm">Failed to load stats: {error}</div>}
          {!data && !error && <div className="text-center py-12 text-navy/50 text-sm">Loading statistics…</div>}
          {data && (
            <>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display font-bold text-navy text-lg">{meta?.title} Leaders</h2>
                <span className="text-xs font-medium text-navy/60">Showing {(page-1)*ITEMS_PER_PAGE+1}-{Math.min(page*ITEMS_PER_PAGE, players.length)} of {players.length}</span>
              </div>

              {players.length===0 ? (
                <div className="text-center py-10 text-sm text-navy/60">No data available for this category.</div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-black/5">
                    <table className="w-full text-sm">
                      <thead className="bg-navy text-white text-xs tracking-widest">
                        <tr><th className="text-left px-4 py-3">RANK</th><th className="text-left px-4 py-3">PLAYER</th><th className="text-left px-4 py-3">TEAM</th><th className="text-right px-4 py-3">{labels[category]}</th></tr>
                      </thead>
                      <tbody>
                        {slice.map((p, idx)=>{
                          const rank=(page-1)*ITEMS_PER_PAGE+idx+1;
                          return (
                            <tr key={p.name+rank} className="border-t border-black/5 hover:bg-cream/40">
                              <td className="px-4 py-2.5 font-mono text-xs font-bold text-navy/70">{rank}</td>
                              <td className="px-4 py-2.5 font-semibold text-navy">{p.name}</td>
                              <td className="px-4 py-2.5"><span className="inline-flex px-2 py-0.5 rounded-full bg-cream border border-gold-muted text-xs font-semibold text-navy">{p.team}</span></td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold text-navy">{meta.fmt(p[meta.key])}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-2">
                    {slice.map((p, idx)=>{
                      const rank=(page-1)*ITEMS_PER_PAGE+idx+1;
                      return (
                        <div key={p.name+rank} className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-navy text-white text-xs font-black">{rank}</span>
                            <div>
                              <div className="text-sm font-bold text-navy leading-tight">{p.name}</div>
                              <div className="text-xs text-navy/60">{p.team}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold tracking-widest text-navy/50">{labels[category]}</div>
                            <div className="font-mono font-bold text-navy">{meta.fmt(p[meta.key])}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </>
              )}
              <div className="mt-4 text-center">
                <a href="https://web.gc.com/organizations/Cr9gsGVDWegK/leaders" target="_blank" rel="noreferrer" className="inline-flex text-xs font-semibold text-navy underline underline-offset-2 hover:text-brick">See more on GameChanger →</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
