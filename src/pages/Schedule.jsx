import { Link } from "react-router-dom";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client.js";
import { groupGamesByWeek, isPlayoffWeek, isSeededPlaceholder, slugForTeam } from "../utils/games.js";
import GameChangerWidget from "../components/GameChangerWidget.jsx";
import SponsorBanner from "../components/SponsorBanner.jsx";

function TeamLink({ name, teams, scorePrefix, isWinner, isLoser, isTie }) {
  if (isSeededPlaceholder(name)) {
    const isWinnerSeed = /^Winner/i.test(name);
    return (
      <span className={isWinnerSeed ? "font-semibold text-navy border border-gold bg-cream px-1.5 py-0.5 rounded text-xs" : "italic text-navy/60 text-xs"} title={name}>
        {scorePrefix}{name}
      </span>
    );
  }
  const color = isWinner ? "text-emerald-700 font-semibold" : isLoser ? "text-red-600" : isTie ? "text-amber-600 font-medium" : "text-navy";
  return (
    <Link to={`/team/${slugForTeam(teams, name)}`} className={`hover:underline underline-offset-2 ${color}`}>
      {scorePrefix}{name}
    </Link>
  );
}

function GameLine({ game, teams, showMeta = true, cornerBadge = null }) {
  const hs = game.result?.home;
  const as = game.result?.away;
  const hasResult = hs !== undefined && as !== undefined;
  const isTie = hasResult && hs === as;
  const homeWin = hasResult && hs > as;
  const awayWin = hasResult && hs < as;
  const homePrefix = hasResult ? `${hs} – ` : "";
  const awayPrefix = hasResult ? `${as} – ` : "";

  if (hasResult) {
    return (
      <div className={`rounded-lg bg-black/[0.03] border border-black/5 px-2.5 py-2 min-w-0 overflow-hidden h-full flex flex-col justify-center relative${cornerBadge ? " pr-14" : ""}`}>
        {cornerBadge && (
          <span className="absolute right-1.5 top-1.5 inline-flex px-2 py-0.5 rounded-full bg-brick text-white text-[10px] font-black tracking-widest">{cornerBadge}</span>
        )}
        {showMeta && (
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded bg-navy text-white shrink-0">FINAL</span>
          <span className="text-[11px] font-medium text-navy/50 shrink-0">{game.date}</span>
          {game.time && <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-gold text-navy shrink-0">{game.time}</span>}
          <Link to="/locations" className="text-[11px] font-black px-1.5 py-0.5 rounded bg-white border border-black/5 text-navy hover:bg-navy hover:text-white transition shrink-0">@{game.location}</Link>
        </div>
        )}
        <div className="flex flex-wrap items-baseline gap-x-1 text-[13px] leading-snug min-w-0 break-words">
          <TeamLink name={game.away} teams={teams} scorePrefix={awayPrefix} isWinner={awayWin} isLoser={homeWin} isTie={isTie} />
          <span className="text-navy/30 text-xs">vs.</span>
          <TeamLink name={game.home} teams={teams} scorePrefix={homePrefix} isWinner={homeWin} isLoser={awayWin} isTie={isTie} />
        </div>
        {game.description && <div className="text-[11px] text-navy/60 mt-1 leading-tight break-words">{game.description}</div>}
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-amber-50/70 border border-amber-200/60 px-2.5 py-2 min-w-0 overflow-hidden h-full flex flex-col justify-center relative${cornerBadge ? " pr-14" : ""}`}>
      {cornerBadge && (
        <span className="absolute right-1.5 top-1.5 inline-flex px-2 py-0.5 rounded-full bg-brick text-white text-[10px] font-black tracking-widest">{cornerBadge}</span>
      )}
      {showMeta && (
      <div className="flex flex-wrap items-center gap-1.5 mb-1">
        <span className="text-[10px] font-black tracking-widest px-1 py-0.5 rounded bg-gold text-navy shrink-0">UPCOMING</span>
        <span className="text-[11px] font-bold text-navy/60 shrink-0">{game.date}</span>
        {game.time && <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-navy text-white shrink-0">{game.time}</span>}
        <Link to="/locations" className="text-[11px] font-black px-1.5 py-0.5 rounded bg-white border border-amber-200 text-navy hover:bg-navy hover:text-white transition shrink-0">@{game.location}</Link>
      </div>
      )}
      <div className="flex flex-wrap items-baseline gap-x-1 text-[13px] leading-snug min-w-0 break-words font-medium">
        <TeamLink name={game.away} teams={teams} scorePrefix="" isWinner={false} isLoser={false} isTie={false} />
        <span className="text-navy/40 text-xs">vs.</span>
        <TeamLink name={game.home} teams={teams} scorePrefix="" isWinner={false} isLoser={false} isTie={false} />
      </div>
      {game.description && <div className="text-[11px] text-brick font-semibold mt-1 leading-tight break-words">{game.description}</div>}
    </div>
  );
}

const SLOT_ORDER = ["9:00 AM", "12:30 PM"];

function groupGamesByTime(games) {
  const groups = [];
  for (const g of games) {
    const key = g.time || "Time TBD";
    let group = groups.find((x) => x.key === key);
    if (!group) {
      group = { key, games: [] };
      groups.push(group);
    }
    group.games.push(g);
  }
  const rank = (k) => {
    const i = SLOT_ORDER.indexOf(k);
    return i === -1 ? SLOT_ORDER.length : i;
  };
  groups.sort((a, b) => rank(a.key) - rank(b.key) || a.key.localeCompare(b.key));
  return groups;
}

const FIELD_ORDER = ["Stark", "Sunflower", "Central", "Calexico"];

function FieldMatrix({ games, teams }) {
  const slots = groupGamesByTime(games);
  const fields = [...new Set(games.map((g) => g.location))].sort((a, b) => {
    const ia = FIELD_ORDER.indexOf(a);
    const ib = FIELD_ORDER.indexOf(b);
    return (ia === -1 ? FIELD_ORDER.length : ia) - (ib === -1 ? FIELD_ORDER.length : ib);
  });
  const gameAt = (field, slot) => games.find((g) => g.location === field && (g.time || "Time TBD") === slot);
  // Most games share the week's Saturday date; flag any played on another day.
  const dateCounts = {};
  games.forEach((g) => { dateCounts[g.date] = (dateCounts[g.date] || 0) + 1; });
  const modalDate = Object.keys(dateCounts).sort((a, b) => dateCounts[b] - dateCounts[a])[0];
  const stacked = (
    <div className="sm:hidden space-y-4">
      {slots.map((s) => (
        <div key={s.key}>
          <span className="inline-flex px-3 py-1 rounded-full bg-navy text-white text-[12px] font-black tracking-widest">{s.key.toUpperCase()}</span>
          <div className="space-y-2 mt-2">
            {s.games.map((g, idx) => (
              <GameLine key={idx} game={g} teams={teams} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <>
    {stacked}
    <div className="hidden sm:block overflow-x-auto">
      <div
        className="grid gap-2.5 min-w-[640px]"
        style={{ gridTemplateColumns: `128px repeat(${slots.length}, minmax(0, 1fr))` }}
      >
        <div />
        {slots.map((s) => (
          <div key={s.key} className="flex items-center px-1">
            <span className="inline-flex px-3 py-1 rounded-full bg-navy text-white text-[12px] font-black tracking-widest">{s.key.toUpperCase()}</span>
          </div>
        ))}
        {fields.map((field) => (
          <Fragment key={field}>
            <Link
              to="/locations"
              className="flex items-center rounded-xl bg-navy px-3 py-2 text-[12px] font-black text-white hover:bg-navy-deep transition self-stretch"
            >
              @{field}
            </Link>
            {slots.map((s) => {
              const g = gameAt(field, s.key);
              return g ? (
                <GameLine
                  key={s.key}
                  game={g}
                  teams={teams}
                  showMeta={false}
                  cornerBadge={g.date !== modalDate ? `${g.dayOfWeek.slice(0, 3).toUpperCase()} ${g.date}` : null}
                />
              ) : (
                <div key={s.key} className="rounded-lg border border-dashed border-black/10 bg-black/[0.02] flex items-center justify-center">
                  <span className="text-navy/20 text-sm">—</span>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
    </>
  );
}

export default function Schedule() {
  const [isReversed, setIsReversed] = useState(false);
  const weekRefs = useRef([]);
  const [showJump, setShowJump] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([api.seasonTeams(), api.seasonGames()])
      .then(([ts, gs]) => {
        setTeams(ts);
        setSchedule(groupGamesByWeek(gs));
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  const nextWeekIndex = useMemo(() => {
    if (!schedule) return -1;
    const idx = schedule.findIndex(w => w.games.some(g => !g.result));
    return idx === -1 ? -1 : idx;
  }, [schedule]);
  const displaySchedule = useMemo(() => {
    if (!schedule) return [];
    return isReversed ? [...schedule].reverse() : schedule;
  }, [schedule, isReversed]);
  const nextDisplayIndex = nextWeekIndex === -1 ? -1 : isReversed ? displaySchedule.length - 1 - nextWeekIndex : nextWeekIndex;

  const jumpToNext = () => {
    const el = nextDisplayIndex !== -1 ? weekRefs.current[nextDisplayIndex] : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (nextDisplayIndex === -1) { setShowJump(false); return; }
    const onScroll = () => {
      const el = weekRefs.current[nextDisplayIndex];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setShowJump(rect.top > 120 || rect.bottom < 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [nextDisplayIndex]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-[20px] overflow-hidden bg-white shadow-xl shadow-black/20 ring-1 ring-black/5">
        <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-0">
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-brick">
              <span className="h-2 w-2 rounded-full bg-brick animate-pulse" /> IMPERIAL VALLEY • FALL/WINTER 2026
            </div>
            <h1 className="font-display font-black text-[30px] sm:text-[38px] leading-none tracking-[-0.03em] text-navy mt-2">
              IVABL<br />
              <span className="text-navy/30">Fall/Winter 2026</span>
            </h1>
            <p className="text-[14px] leading-6 text-navy/70 mt-3 max-w-[520px]">
              Targeting 10 teams. Eight games per team. Saturday mornings — 9:00 & 12:30 first pitch. Home team keeps score + GameChanger lineups.
              <strong className="text-navy"> No tobacco or alcohol on the field.</strong>
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs font-semibold bg-cream border border-gold-muted text-navy px-3 py-1.5 rounded-full">Sat 9:00 & 12:30</span>
              <span className="text-xs font-semibold bg-cream border border-gold-muted text-navy px-3 py-1.5 rounded-full">8 games per team</span>
              <span className="text-xs font-semibold bg-cream border border-gold-muted text-navy px-3 py-1.5 rounded-full">Kickoff Oct 31</span>
            </div>
            <div className="flex gap-2 mt-5 flex-wrap">
              <Link to="/standings" className="px-4 py-2 rounded-full bg-navy text-white text-sm font-semibold hover:bg-navy-deep transition">View standings</Link>
              <Link to="/locations" className="px-4 py-2 rounded-full bg-white border border-navy/15 text-navy text-sm font-semibold hover:bg-cream transition">Fields & maps</Link>
            </div>
          </div>
          <div className="bg-cream border-t md:border-t-0 md:border-l border-gold-muted/60 p-6 flex flex-col items-center justify-center gap-4">
            <img src="/img/league_logo.jpeg" alt="League logo" className="w-full max-w-[260px] rounded-2xl shadow-lg bg-white p-3" />
            <p className="text-xs font-semibold text-navy/60 text-center">Imperial Valley’s wood-bat league — since 2019</p>
          </div>
        </div>
      </div>

      {/* GameChanger + Sponsors — 50/50 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full flex flex-col">
          <GameChangerWidget />
        </div>
        <aside className="hidden lg:block sticky top-[88px] h-full">
          <div className="h-full flex flex-col">
            <SponsorBanner className="h-full" />
          </div>
        </aside>
      </div>
      {/* Sponsors — mobile: above schedule */}
      <div className="lg:hidden">
        <SponsorBanner compact />
      </div>

      {schedule === null && !loadError && (
        <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 p-8 text-center text-sm text-navy/50">
          Loading schedule…
        </div>
      )}
      {loadError && (
        <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 p-8 text-center text-sm text-brick font-semibold">
          Failed to load schedule: {loadError}
        </div>
      )}
      {displaySchedule.length === 0 && schedule !== null && !loadError && (
        <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
          <div className="p-6 sm:p-8 text-center">
            <div className="text-[11px] font-black tracking-[0.16em] text-gold">FALL/WINTER 2026</div>
            <h2 className="font-display font-black text-navy text-xl mt-2">Schedule drops soon</h2>
            <p className="text-sm text-navy/60 mt-2 max-w-[480px] mx-auto leading-relaxed">
              Games begin October 31st — Saturday mornings at Stark, Sunflower, Central HS and Calexico HS.
            </p>
            <div className="flex gap-2 mt-5 justify-center flex-wrap">
              <Link to="/past-seasons" className="px-5 py-2.5 rounded-full bg-white border border-navy/15 text-navy text-sm font-semibold hover:bg-cream transition">Past seasons</Link>
            </div>
          </div>
        </div>
      )}
      {displaySchedule.length > 0 && (
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        {/* Schedule — Week Cards */}
        <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-navy to-navy-mid flex flex-wrap gap-3 items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg">Schedule • Saturdays</h2>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Winner</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-red-400" /> Loss</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white px-2.5 py-1 rounded-full"><span className="h-2 w-2 rounded-full bg-amber-300" /> Tie</span>
            <button onClick={() => setIsReversed(v => !v)} className="ml-1 px-3 py-1.5 rounded-full bg-white text-navy text-xs font-bold hover:bg-cream transition">
              {isReversed ? "Oldest first ↑" : "Newest first ↓"}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 bg-cream/20">
          {displaySchedule.map((week, wi) => {
            const isPlayoff = isPlayoffWeek(week);
            const prevWeek = wi > 0 ? displaySchedule[wi - 1] : null;
            const showPlayoffHeader = isPlayoff && prevWeek && !isPlayoffWeek(prevWeek);
            const isNext = wi === nextDisplayIndex;
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
                <div
                  ref={el => { weekRefs.current[wi] = el; }}
                  className={`rounded-2xl overflow-hidden ring-1 shadow-sm scroll-mt-24 ${isNext ? "ring-2 ring-navy !bg-amber-50/20" : ""} ${isPlayoff ? "ring-amber-200 bg-amber-50/30" : "ring-black/5 bg-white"}`}
                >
                  <div className={`px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 ${isPlayoff ? "bg-navy text-white" : "bg-navy text-white/95"}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full text-xs font-black ${isPlayoff ? "bg-amber-300 text-navy" : "bg-white text-navy"}`}>
                        {typeof week.week === "number" ? week.week : "P"}
                      </span>
                      <span className="font-display font-bold text-sm sm:text-[15px]">
                        {isPlayoff ? week.week : `Week ${week.week}`}
                      </span>
                      {isPlayoff && <span className="text-[11px] font-bold tracking-widest text-amber-200">PLAYOFF</span>}
                      {isNext && <span className="px-2 py-0.5 rounded-full bg-amber-300 text-navy text-[11px] font-black tracking-widest">NEXT</span>}
                    </div>
                    <span className="text-xs font-medium text-white/70">
                      {week.games.length} {week.games.length === 1 ? "game" : "games"}
                      {hasGames && week.games[0]?.date && ` • Sat ${week.games[0].date}`}
                    </span>
                  </div>

                  <div className="p-3 sm:p-4">
                    <FieldMatrix games={week.games} teams={teams} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
      {showJump && nextDisplayIndex !== -1 && (
        <button
          onClick={jumpToNext}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-navy text-white text-sm font-bold shadow-xl hover:bg-navy-deep transition border border-white/10"
        >
          <span className="text-base">↓</span> Jump to Next
          <span className="hidden sm:inline font-medium text-white/60">
            — {typeof displaySchedule[nextDisplayIndex]?.week === "number" ? `Week ${displaySchedule[nextDisplayIndex].week}` : displaySchedule[nextDisplayIndex]?.week}
          </span>
        </button>
      )}
    </div>
  );
}
