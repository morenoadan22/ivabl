// Verifies Fall/Winter 2026 scheduling rules. Run: npm run verify
// Rules: same-tier pairs meet at most once AND at least once (a team's
// unplayed opponents are always cross-tier); 5 games/week (6 in week 4 for
// the Saturday IVC doubleheader); 8 games/team (guests exempt); 4H/4A
// (Hot Shotz 3H/5A by exception: their week-4 home game moved to SBC's
// host field when the IVC games displaced Arabes/SBC); Calexico Baseball
// always 9:00 AM; Aztecas/SBC never share a window (same day); SBC hosts
// at Central, Calexico Baseball hosts at Calexico (home team hosts when
// they meet); no other team uses those fields; no field+date+time clashes.
import { schedule } from "../src/data/schedule.js";
import { teams, locationMeta } from "../src/data/teams.js";

const byName = Object.fromEntries(teams.map((t) => [t.name, t]));
const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); };

const GUESTS = new Set(teams.filter((t) => t.guest).map((t) => t.name));
const gp = {}, ha = {}, pairMeetings = {}, sameTierPairs = {};
for (const t of teams) { gp[t.name] = 0; ha[t.name + "|H"] = 0; ha[t.name + "|A"] = 0; }

schedule.forEach((week, wi) => {
  const w = `week ${week.week}`;
  const seen = new Set(), slots = new Set();
  for (const g of week.games) {
    const isGuestGame = GUESTS.has(g.away) || GUESTS.has(g.home);
    for (const [side, key] of [["away", g.away], ["home", g.home]]) {
      ok(byName[key], `${w}: unknown team ${key}`);
      ok(!seen.has(key + "@" + g.date + g.time), `${w}: ${key} plays twice at ${g.time} on ${g.date}`);
      ok([...seen].filter((s) => s.startsWith(key + "@")).length < 2, `${w}: ${key} plays 3+ games`);
      seen.add(key + "@" + g.date + g.time);
      gp[key]++;
      ha[key + (side === "home" ? "|H" : "|A")]++;
    }
    const divA = byName[g.away]?.division, divH = byName[g.home]?.division;
    if (!isGuestGame) ok(divA && divH, `${w}: missing skill tier (${g.away} vs ${g.home})`);
    const pair = [g.away, g.home].sort().join(" v ");
    pairMeetings[pair] = (pairMeetings[pair] || 0) + 1;
    if (!isGuestGame && divA === divH) sameTierPairs[pair] = (sameTierPairs[pair] || 0) + 1;
    ok(locationMeta[g.location], `${w}: unknown field ${g.location}`);
    ok(g.time, `${w}: missing time (${g.away} vs ${g.home})`);
    const slot = g.date + "|" + g.location + "@" + g.time;
    ok(!slots.has(slot), `${w}: field clash ${slot}`);
    slots.add(slot);
    // venue rules: fixed home fields, home team hosts when they meet
    const fixed = (t) => (t === "SBC" ? "Central" : t === "Calexico Baseball" ? "Calexico" : null);
    const vh = fixed(g.home), va = fixed(g.away);
    const want = vh && va && vh !== va ? vh : vh || va;
    if (want) ok(g.location === want, `${w}: ${g.away} @ ${g.home} should be at ${want}, got ${g.location}`);
    else ok(g.location !== "Central" && g.location !== "Calexico", `${w}: ${g.away} vs ${g.home} misuses ${g.location}`);
  }
});

for (const w of schedule) {
  // Week 4 runs six: four league games plus the two Saturday IVC games.
  const want = w.week === 4 ? 6 : 5;
  ok(w.games.length === want, `week ${w.week} has ${w.games.length} games, want ${want}`);
}

// Calexico Baseball prefers 9:00 AM games.
// Shared players: Aztecas and SBC must play in different time windows
// unless they face each other.
for (const w of schedule) {
  const gameOf = (t) => w.games.find((g) => g.away === t || g.home === t);
  const gc = gameOf("Calexico Baseball");
  if (gc) ok(gc.time === "9:00 AM", `week ${w.week}: Calexico Baseball plays at ${gc.time}`);
  const ga = gameOf("Aztecas"), gs = gameOf("SBC");
  if (ga && gs && ga !== gs && ga.date === gs.date) {
    ok(ga.time !== gs.time,
      `week ${w.week}: Aztecas (${ga.time}) and SBC (${gs.time}) overlap on ${ga.date}`);
  }
}

for (const [pair, n] of Object.entries(sameTierPairs)) {
  ok(n <= 1, `same-tier repeat: ${pair} meets ${n}x`);
}

// Every same-tier pair must meet: the one team a team doesn't face in
// 8 games must be from outside its tier (Aztecas/Arabes play 7 league
// games + 1 IVC guest game, so the same still applies to them).
{
  const leagueTeams = teams.filter((t) => !t.guest);
  const faced = new Set();
  for (const w of schedule) {
    for (const g of w.games) {
      if (GUESTS.has(g.away) || GUESTS.has(g.home)) continue;
      faced.add([g.away, g.home].sort().join(" v "));
    }
  }
  for (let i = 0; i < leagueTeams.length; i++) {
    for (let j = i + 1; j < leagueTeams.length; j++) {
      const a = leagueTeams[i], b = leagueTeams[j];
      if (a.division && a.division === b.division) {
        const pair = [a.name, b.name].sort().join(" v ");
        ok(faced.has(pair), `same-tier pair never meets: ${pair}`);
      }
    }
  }
}

for (const t of teams) {
  if (t.guest) continue; // guest teams play a partial schedule by design
  ok(gp[t.name] === 8, `${t.name} plays ${gp[t.name]} games, want 8`);
  const wantHA = t.name === "Hot Shotz" ? [3, 5] : [4, 4]; // see header: IVC displacement
  ok(ha[t.name + "|H"] === wantHA[0] && ha[t.name + "|A"] === wantHA[1],
    `${t.name} home/away ${ha[t.name + "|H"]}/${ha[t.name + "|A"]}, want ${wantHA[0]}/${wantHA[1]}`);
}

if (failures.length) {
  console.error("verify-schedule FAILED:\n" + failures.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log(`verify-schedule passed: ${schedule.length} weeks, ${teams.length} teams, all rules hold.`);
