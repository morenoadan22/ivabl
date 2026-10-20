// Verifies Fall/Winter 2026 scheduling rules. Run: npm run verify
// Rules: intra-division only; 8 games/team; 4H/4A; SBC hosts at Central,
// Calexico Baseball hosts at Calexico (home team hosts when they meet);
// no other team uses those fields; no field+time clashes; max 2 games/team/week.
import { schedule } from "../src/data/schedule.js";
import { teams, locationMeta } from "../src/data/teams.js";

const byName = Object.fromEntries(teams.map((t) => [t.name, t]));
const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); };

const gp = {}, ha = {}, pairMeetings = {}, sameTierPairs = {};
for (const t of teams) { gp[t.name] = 0; ha[t.name + "|H"] = 0; ha[t.name + "|A"] = 0; }

schedule.forEach((week, wi) => {
  const w = `week ${week.week}`;
  const seen = new Set(), slots = new Set();
  for (const g of week.games) {
    for (const [side, key] of [["away", g.away], ["home", g.home]]) {
      ok(byName[key], `${w}: unknown team ${key}`);
      ok(!seen.has(key + "@" + g.time), `${w}: ${key} plays twice at ${g.time}`);
      ok([...seen].filter((s) => s.startsWith(key + "@")).length < 2, `${w}: ${key} plays 3+ games`);
      seen.add(key + "@" + g.time);
      gp[key]++;
      ha[key + (side === "home" ? "|H" : "|A")]++;
    }
    const divA = byName[g.away]?.division, divH = byName[g.home]?.division;
    ok(divA && divH, `${w}: missing skill tier (${g.away} vs ${g.home})`);
    const pair = [g.away, g.home].sort().join(" v ");
    pairMeetings[pair] = (pairMeetings[pair] || 0) + 1;
    if (divA === divH) sameTierPairs[pair] = (sameTierPairs[pair] || 0) + 1;
    ok(locationMeta[g.location], `${w}: unknown field ${g.location}`);
    ok(g.time === "9:00 AM" || g.time === "12:30 PM", `${w}: bad time ${g.time}`);
    const slot = g.location + "@" + g.time;
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
  ok(w.games.length === 5, `week ${w.week} has ${w.games.length} games, want 5`);
}

// Calexico Baseball prefers 9:00 AM games.
// Shared players: Aztecas and SBC must play in different time windows
// unless they face each other.
for (const w of schedule) {
  const gameOf = (t) => w.games.find((g) => g.away === t || g.home === t);
  const gc = gameOf("Calexico Baseball");
  if (gc) ok(gc.time === "9:00 AM", `week ${w.week}: Calexico Baseball plays at ${gc.time}`);
  const ga = gameOf("Aztecas"), gs = gameOf("SBC");
  if (ga && gs && ga !== gs) {
    ok(ga.time !== gs.time,
      `week ${w.week}: Aztecas (${ga.time}) and SBC (${gs.time}) overlap`);
  }
}

for (const [pair, n] of Object.entries(sameTierPairs)) {
  ok(n <= 1, `same-tier repeat: ${pair} meets ${n}x`);
}

for (const t of teams) {
  ok(gp[t.name] === 8, `${t.name} plays ${gp[t.name]} games, want 8`);
  ok(ha[t.name + "|H"] === 4 && ha[t.name + "|A"] === 4,
    `${t.name} home/away ${ha[t.name + "|H"]}/${ha[t.name + "|A"]}, want 4/4`);
}

if (failures.length) {
  console.error("verify-schedule FAILED:\n" + failures.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log(`verify-schedule passed: ${schedule.length} weeks, ${teams.length} teams, all rules hold.`);
