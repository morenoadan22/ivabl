import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useSession } from "../hooks/useSession.js";
import UmpireProfileForm from "../components/UmpireProfileForm.jsx";

function fmtGame(g) {
  return `${g.away} vs ${g.home} — ${g.date} ${g.time} @ ${g.location}`;
}

function timeToMinutes(t) {
  const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(t || "");
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

// Umpires only see 3 weeks ahead: games from today through 21 days out.
// Games without a parseable MM/DD date (e.g. future playoff placeholders) stay visible.
const SEASON_YEAR = 2026;
const AHEAD_DAYS = 21;
function gameDay(g) {
  const m = /^(\d{1,2})\/(\d{1,2})/.exec(g.date || "");
  if (!m) return null;
  return new Date(SEASON_YEAR, Number(m[1]) - 1, Number(m[2]));
}
function inWindow(g) {
  const d = gameDay(g);
  if (!d) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today && d <= new Date(today.getTime() + AHEAD_DAYS * 86400000);
}

export default function Umpires() {
  const { user, login, logout } = useSession();
  const [roster, setRoster] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [games, setGames] = useState([]);
  const [claims, setClaims] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [claimsOpen, setClaimsOpen] = useState(true);
  const [busy, setBusy] = useState("");
  const profileIncomplete = !profile || !profile.first_name || !profile.phone;

  useEffect(() => {
    api.roster().then(setRoster).catch(() => setRoster([]));
  }, []);

  const load = async () => {
    const [gs, cs, pf] = await Promise.all([api.games(), api.myClaims(), api.profile()]);
    setGames(gs);
    setClaims(cs);
    setProfile(pf);
  };

  useEffect(() => {
    if (user) load().catch((e) => setError(e.message));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const weeks = useMemo(() => {
    const byWeek = new Map();
    for (const g of games.filter(inWindow)) {
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
  }, [games]);

  const doLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(name);
    } catch (err) {
      setError(err.message);
    }
  };

  const act = async (fn) => {
    setError("");
    setBusy("working");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const saveProfile = async (fields) => {
    setError("");
    setBusy("profile");
    try {
      setProfile(await api.saveProfile(fields));
      setProfileOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  if (user === undefined) return <div className="p-6 text-white/60">Loading…</div>;

  if (!user) {
    return (
      <div className="max-w-[480px] mx-auto px-4 py-10">
        <h1 className="font-display font-black text-white text-2xl">Umpire Login</h1>
        <p className="text-sm text-white/60 mt-1">Pick your name to log in — no code needed.</p>
        <form onSubmit={doLogin} className="mt-4 space-y-3 bg-white rounded-2xl shadow p-5 ring-1 ring-black/5">
          <label className="block text-sm font-semibold text-navy">
            Name
            <select value={name} onChange={(e) => setName(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-navy">
              <option value="">Select…</option>
              {roster.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
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
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display font-black text-white text-2xl">Umpire Schedule</h1>
          <p className="text-sm text-white/60">Signed in as <strong className="text-white">{user.name}</strong></p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setProfileOpen((o) => !o)}
            className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition">
            {profileOpen ? "Hide profile" : "My profile"}
          </button>
          <button onClick={logout} className="px-4 py-2 rounded-full bg-white border border-navy/15 text-navy text-sm font-semibold hover:bg-cream transition">
            Log out
          </button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-brick font-semibold">{error}</p>}

      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="font-display font-bold text-white text-lg">
          My claims{claims.length > 0 && <span className="text-white/60"> ({claims.length})</span>}
        </h2>
        {claims.length > 0 && (
          <button onClick={() => setClaimsOpen((o) => !o)}
            className="text-xs font-bold text-white/60 hover:text-white transition shrink-0">
            {claimsOpen ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {claims.length === 0 ? (
        <p className="text-sm text-white/60">No requests yet. Claim a game below.</p>
      ) : claimsOpen ? (
        <div className="space-y-2">
          {claims.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-2.5 ring-1 ring-black/5 text-sm">
              <span className="text-navy">{fmtGame(c)}</span>
              <span className="flex items-center gap-2 shrink-0">
                <StatusPill status={c.status} />
                {c.status === "pending" && (
                  <button disabled={!!busy} onClick={() => act(() => api.withdraw(c.id))}
                    className="px-3 py-1 rounded-full bg-white border border-brick/40 text-brick text-xs font-bold hover:bg-brick hover:text-white transition disabled:opacity-50">
                    Withdraw
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {profileOpen ? (
        <>
          <h2 className="font-display font-bold text-white text-lg mt-6 mb-1">My profile</h2>
          <p className="text-sm text-white/60 mb-2">Your contact and payment details for the commissioner.</p>
          <div className="bg-white rounded-2xl shadow ring-1 ring-black/5 p-4">
            {profile && (
              <UmpireProfileForm key={profile.id} initial={profile} onSave={saveProfile} busy={busy === "profile"} />
            )}
          </div>
        </>
      ) : profileIncomplete && (
        <button onClick={() => setProfileOpen(true)}
          className="mt-4 w-full text-left text-sm bg-gold/15 border border-gold/40 text-gold rounded-xl px-4 py-2.5 hover:bg-gold/25 transition">
          Add your contact info so the commissioner can reach you and pay you →
        </button>
      )}

      <h2 className="font-display font-bold text-white text-lg mt-6 mb-1">Upcoming games</h2>
      <p className="text-sm text-white/60 mb-2">Showing the next 3 weeks. Up to two games per week — same field, different times. Your other requests stay open until the commissioner decides them.</p>
      {weeks.length === 0 && (
        <p className="text-sm text-white/60">No games in the next 3 weeks.</p>
      )}
      <div className="space-y-4">
        {weeks.map(([week, slots]) => (
          <div key={week} className="bg-white rounded-2xl shadow ring-1 ring-black/5 overflow-hidden">
            <div className="bg-navy text-white px-4 py-2 text-sm font-bold">Week {week}</div>
            {slots.map(([time, gs]) => (
              <div key={time}>
                <div className="px-4 pt-2.5 pb-1 text-xs font-black uppercase tracking-wider text-navy/50">{time}</div>
                <div className="divide-y divide-black/5">
                  {gs.map((g) => (
                    <div key={g.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                      <span className="text-navy">
                        <Link to="/locations" className="text-[11px] font-black px-1.5 py-0.5 rounded bg-white border border-black/5 text-navy hover:bg-navy hover:text-white transition shrink-0 mr-2">@{g.location}</Link>
                        {g.away} vs {g.home} <span className="text-navy/50">— {g.date}</span>
                      </span>
                      <GameAction game={g} busy={busy} onAct={act} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const cls = status === "approved"
    ? "bg-green-100 text-green-800"
    : status === "denied"
      ? "bg-red-100 text-red-800"
      : "bg-amber-100 text-amber-800";
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${cls}`}>{status}</span>;
}

function GameAction({ game, busy, onAct }) {
  if (game.my_claim_id) {
    return <StatusPill status={game.my_claim_status} />;
  }
  if (game.approved_count > 0) {
    return <span className="text-xs font-bold text-navy/40 shrink-0">Filled</span>;
  }
  return (
    <span className="flex items-center gap-2 shrink-0">
      {game.other_pending > 0 && (
        <span className="text-[11px] text-navy/50 font-semibold">{game.other_pending} pending</span>
      )}
      <button disabled={!!busy} onClick={() => onAct(() => api.claim(game.id))}
        className="px-4 py-1.5 rounded-full bg-gold text-navy text-xs font-black hover:brightness-95 transition disabled:opacity-50">
        Request
      </button>
    </span>
  );
}
