import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useSession } from "../hooks/useSession.js";
import UmpireProfileForm from "../components/UmpireProfileForm.jsx";

function ScoreRow({ game, onSave, onClear, busy }) {
  const [away, setAway] = useState(game.result?.away ?? "");
  const [home, setHome] = useState(game.result?.home ?? "");
  const dirty = String(away ?? "") !== String(game.result?.away ?? "") ||
    String(home ?? "") !== String(game.result?.home ?? "");
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
      <span className="text-navy text-sm">
        <Link to="/locations" className="text-[11px] font-black px-1.5 py-0.5 rounded bg-white border border-black/5 text-navy hover:bg-navy hover:text-white transition shrink-0 mr-2">@{game.location}</Link>
        {game.away} vs {game.home} <span className="text-navy/50">— {game.date} {game.time}</span>
      </span>
      <span className="flex items-center gap-1.5 shrink-0">
        <input value={away} onChange={(e) => setAway(e.target.value)} placeholder="A" inputMode="numeric"
          className="w-12 rounded-lg border border-navy/15 px-2 py-1 text-sm text-navy text-center" />
        <span className="text-navy/40 text-sm">–</span>
        <input value={home} onChange={(e) => setHome(e.target.value)} placeholder="H" inputMode="numeric"
          className="w-12 rounded-lg border border-navy/15 px-2 py-1 text-sm text-navy text-center" />
        <button disabled={!!busy || !dirty} onClick={() => onSave(game.id, away, home)}
          className="px-3 py-1 rounded-full bg-navy text-white text-xs font-black hover:bg-navy-deep transition disabled:opacity-40">
          {busy ? "…" : "Save"}
        </button>
        {game.result && (
          <button disabled={!!busy} onClick={() => onClear(game.id)}
            className="px-3 py-1 rounded-full bg-white border border-navy/15 text-navy/60 text-xs font-bold hover:bg-cream transition disabled:opacity-40">
            Clear
          </button>
        )}
      </span>
    </div>
  );
}

function timeToMinutes(t) {
  const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(t || "");
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

export default function Admin() {
  const { user, login, logout } = useSession();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [queue, setQueue] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [umpires, setUmpires] = useState([]);
  const [statCount, setStatCount] = useState(null);
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState("");

  const load = async () => {
    const [q, c, w, u, s] = await Promise.all([
      api.queue(), api.coverage(), api.workload(), api.adminUmpires(), api.seasonStatsCsv(),
    ]);
    setQueue(q);
    setCoverage(c);
    setWorkload(w);
    setUmpires(u);
    setStatCount(Math.max(0, s.trim().split("\n").length - 1));
  };

  useEffect(() => {
    if (user?.role === "admin") load().catch((e) => setError(e.message));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const doLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const me = await login(name, code);
      if (me.role !== "admin") {
        setError("That login is not an admin account.");
      }
      setCode("");
    } catch (err) {
      setError(err.message);
    }
  };

  const decide = async (id, approve) => {
    setError("");
    setBusy(String(id));
    try {
      await api.decide(id, approve);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const [assignSel, setAssignSel] = useState({});
  const umpireLabel = (u) =>
    [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name;
  const activeUmpires = umpires.filter((u) => u.role === "umpire" && u.active);
  const doAssign = async (gameId) => {
    const umpireId = Number(assignSel[gameId]);
    if (!umpireId) return;
    setError("");
    setBusy(`assign-${gameId}`);
    try {
      await api.assign(gameId, umpireId);
      setAssignSel((s) => ({ ...s, [gameId]: "" }));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };
  const doUnassign = async (g) => {
    if (!window.confirm(`Remove ${g.approved_umpire} from ${g.away} vs ${g.home}?`)) return;
    setError("");
    setBusy(`unassign-${g.id}`);
    try {
      await api.unassign(g.approved_claim_id);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const saveUmpire = (id) => async (fields) => {
    setError("");
    setBusy(`umpire-${id}`);
    try {
      await api.saveUmpire(id, fields);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const saveScores = async (id, away, home) => {
    setError("");
    setBusy(`scores-${id}`);
    try {
      await api.saveScores(
        id,
        away === "" ? null : Number(away),
        home === "" ? null : Number(home)
      );
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const uploadStats = async () => {
    setError("");
    setBusy("stats");
    try {
      const r = await api.uploadStats(csv);
      setCsv("");
      await load();
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const uncovered = coverage.filter((g) => !g.approved_umpire);

  const weeks = useMemo(() => {
    const byWeek = new Map();
    for (const g of coverage) {
      if (!byWeek.has(g.week)) byWeek.set(g.week, new Map());
      const byTime = byWeek.get(g.week);
      if (!byTime.has(g.time)) byTime.set(g.time, []);
      byTime.get(g.time).push(g);
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([week, byTime]) => [
        week,
        [...byTime.entries()]
          .sort((a, b) => timeToMinutes(a[0]) - timeToMinutes(b[0]))
          .map(([time, gs]) => [time, [...gs].sort((x, y) => x.location.localeCompare(y.location))]),
      ]);
  }, [coverage]);

  if (user === undefined) return <div className="p-6 text-white/60">Loading…</div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-[480px] mx-auto px-4 py-10">
        <h1 className="font-display font-black text-white text-2xl">Admin Login</h1>
        <p className="text-sm text-white/60 mt-1">Commissioner access only.</p>
        <form onSubmit={doLogin} className="mt-4 space-y-3 bg-white rounded-2xl shadow p-5 ring-1 ring-black/5">
          <label className="block text-sm font-semibold text-navy">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="username"
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-navy" />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Admin code
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required autoComplete="off"
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-navy uppercase" />
          </label>
          {error && <p className="text-sm text-brick font-semibold">{error}</p>}
          <button type="submit" className="w-full px-4 py-2.5 rounded-full bg-navy text-white text-sm font-black hover:bg-navy-deep transition">
            Log in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-white text-2xl">Umpire Admin</h1>
          <p className="text-sm text-white/60">
            {queue.length} pending • {uncovered.length} games uncovered
          </p>
        </div>
        <button onClick={logout} className="px-4 py-2 rounded-full bg-white border border-navy/15 text-navy text-sm font-semibold hover:bg-cream transition">
          Log out
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-brick font-semibold">{error}</p>}

      <h2 className="font-display font-bold text-white text-lg mt-6 mb-1">Pending requests</h2>
      <p className="text-sm text-white/60 mb-2">Up to two games per umpire per week — same field, different times. Approving a second game drops their other pending requests that week.</p>
      {queue.length === 0 ? (
        <p className="text-sm text-white/60">Queue is clear.</p>
      ) : (
        <div className="space-y-2">
          {queue.map((q) => (
            <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-xl px-4 py-2.5 ring-1 ring-black/5 text-sm">
              <span className="text-navy">
                <strong>{q.umpire}</strong> → {q.away} vs {q.home}, {q.date} {q.time} @{q.location}
              </span>
              <span className="flex gap-2 shrink-0">
                <button disabled={!!busy} onClick={() => decide(q.id, true)}
                  className="px-4 py-1.5 rounded-full bg-navy text-white text-xs font-black hover:bg-navy-deep transition disabled:opacity-50">
                  {busy === String(q.id) ? "…" : "Approve"}
                </button>
                <button disabled={!!busy} onClick={() => decide(q.id, false)}
                  className="px-4 py-1.5 rounded-full bg-white border border-brick/40 text-brick text-xs font-black hover:bg-brick hover:text-white transition disabled:opacity-50">
                  Deny
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display font-bold text-white text-lg mt-6 mb-2">Coverage</h2>
      <div className="space-y-4">
        {weeks.map(([week, slots]) => (
          <div key={week} className="bg-white rounded-2xl shadow ring-1 ring-black/5 overflow-hidden">
            <div className="bg-navy text-white px-4 py-2 text-sm font-bold">Week {week}</div>
            {slots.map(([time, gs]) => (
              <div key={time}>
                <div className="px-4 pt-2.5 pb-1 text-xs font-black uppercase tracking-wider text-navy/50">{time}</div>
                <div className="divide-y divide-black/5 text-sm">
                  {gs.map((g) => (
                    <div key={g.id} className="flex items-center justify-between gap-2 px-4 py-2">
                      <span className="text-navy">
                        <Link to="/locations" className="text-[11px] font-black px-1.5 py-0.5 rounded bg-white border border-black/5 text-navy hover:bg-navy hover:text-white transition shrink-0 mr-2">@{g.location}</Link>
                        {g.away} vs {g.home} <span className="text-navy/50">— {g.date}</span>
                      </span>
                      {g.approved_umpire
                        ? <span className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold text-green-800 bg-green-100 px-2.5 py-0.5 rounded-full">{g.approved_umpire}</span>
                          <button disabled={!!busy} onClick={() => doUnassign(g)}
                            className="px-3 py-1 rounded-full bg-white border border-brick/40 text-brick text-xs font-black hover:bg-brick hover:text-white transition disabled:opacity-40">
                            {busy === `unassign-${g.id}` ? "…" : "Remove"}
                          </button>
                        </span>
                        : <span className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-black text-brick bg-red-50 px-2.5 py-0.5 rounded-full">OPEN</span>
                          <select value={assignSel[g.id] ?? ""} onChange={(e) => setAssignSel((s) => ({ ...s, [g.id]: e.target.value }))}
                            className="text-xs border border-navy/15 rounded-full pl-2 pr-1 py-1 text-navy bg-white max-w-[130px]">
                            <option value="">Umpire…</option>
                            {activeUmpires.map((u) => <option key={u.id} value={u.id}>{umpireLabel(u)}</option>)}
                          </select>
                          <button disabled={!!busy || !assignSel[g.id]} onClick={() => doAssign(g.id)}
                            className="px-3 py-1 rounded-full bg-navy text-white text-xs font-black hover:bg-navy-deep transition disabled:opacity-40">
                            {busy === `assign-${g.id}` ? "…" : "Assign"}
                          </button>
                        </span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <h2 className="font-display font-bold text-white text-lg mt-6 mb-1">Results</h2>
      <p className="text-sm text-white/60 mb-2">Enter final scores (away – home). Saving updates standings everywhere.</p>
      <div className="space-y-4">
        {weeks.map(([week, slots]) => (
          <div key={week} className="bg-white rounded-2xl shadow ring-1 ring-black/5 overflow-hidden">
            <div className="bg-navy text-white px-4 py-2 text-sm font-bold">Week {week}</div>
            {slots.map(([time, gs]) => (
              <div key={time}>
                <div className="px-4 pt-2.5 pb-1 text-xs font-black uppercase tracking-wider text-navy/50">{time}</div>
                <div className="divide-y divide-black/5">
                  {gs.map((g) => (
                    <ScoreRow key={g.id} game={g}
                      onSave={saveScores}
                      onClear={(id) => saveScores(id, "", "")}
                      busy={busy === `scores-${g.id}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <h2 className="font-display font-bold text-white text-lg mt-6 mb-1">Statistics upload</h2>
      <p className="text-sm text-white/60 mb-2">
        Paste a GameChanger CSV export to replace the stats leaders.
        {statCount !== null && <> Currently loaded: <strong className="text-white">{statCount}</strong> stat lines.</>}
      </p>
      <div className="bg-white rounded-2xl shadow ring-1 ring-black/5 p-4">
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={4}
          placeholder="Paste CSV here (First Name, Last Name, Team, …)"
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm text-navy font-mono" />
        <button onClick={uploadStats} disabled={!!busy || !csv.trim()}
          className="mt-2 px-5 py-2 rounded-full bg-navy text-white text-xs font-black hover:bg-navy-deep transition disabled:opacity-40">
          {busy === "stats" ? "Uploading…" : "Replace stats"}
        </button>
      </div>

      <h2 className="font-display font-bold text-white text-lg mt-6 mb-2">Workload</h2>
      <div className="bg-white rounded-2xl shadow ring-1 ring-black/5 divide-y divide-black/5 text-sm">
        {workload.map((r) => (
          <div key={r.name} className="flex items-center justify-between px-4 py-2">
            <span className="text-navy font-semibold">{r.name}</span>
            <span className="text-navy/60 text-xs">{r.approved} approved • {r.pending} pending</span>
          </div>
        ))}
      </div>

      <h2 className="font-display font-bold text-white text-lg mt-6 mb-1">Umpires</h2>
      <p className="text-sm text-white/60 mb-2">Contact details and payment preferences for each account.</p>
      <div className="space-y-3">
        {umpires.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl shadow ring-1 ring-black/5 p-4">
            <div className="font-bold text-navy text-sm mb-3">
              {u.name}
              {u.role === "admin" && (
                <span className="ml-2 text-[10px] font-black uppercase tracking-wide bg-navy text-white px-2 py-0.5 rounded-full">admin</span>
              )}
            </div>
            <UmpireProfileForm
              key={`${u.id}-${u.first_name}-${u.last_name}-${u.facebook_url}-${u.phone}-${u.payment}`}
              initial={u}
              onSave={saveUmpire(u.id)}
              busy={busy === `umpire-${u.id}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
