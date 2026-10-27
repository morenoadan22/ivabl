// Exports src/data/schedule.js to GameChanger's CSV import format.
// Columns: date (MM/DD/YYYY), time, home, away, location (full address), duration (blank = GC default 60).
// Run: node scripts/export-schedule-csv.mjs [out.csv]
import { writeFileSync } from "node:fs";
import { schedule } from "../src/data/schedule.js";
import { locationMeta } from "../src/data/teams.js";

const YEAR = 2026;
const DURATION_MIN = 150; // 2.5 hours per game
// Schedule name -> exact GameChanger team name. Teams with no entry (e.g. IVC,
// which is not a confirmed GC team) are left out of the export.
const GC_NAME = {
  Arabes: "Arabes",
  Aztecas: "Aztecas",
  "Calexico Baseball": "Calexico Baseball",
  Dawgz: "Dawgz",
  "Hot Shotz": "Hot Shotz",
  Impact: "Impact",
  "Los Gringos": "Los Gringos",
  Outlaws: "Outlaws",
  SBC: "SBC",
  Sandlot: "The Sandlot",
};
const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const lines = ["date,time,home,away,location,duration"];
let skipped = 0;
for (const w of schedule) {
  for (const g of w.games) {
    const home = GC_NAME[g.home], away = GC_NAME[g.away];
    if (!home || !away) { skipped++; continue; }
    const [m, d] = g.date.split("/");
    const date = `${m.padStart(2, "0")}/${d.padStart(2, "0")}/${YEAR}`;
    const location = locationMeta[g.location]?.address ?? g.location;
    lines.push([date, g.time, home, away, q(location), DURATION_MIN].join(","));
  }
}
const out = process.argv[2] ?? "gamechanger-import.csv";
writeFileSync(new URL(`../${out}`, import.meta.url), lines.join("\n") + "\n");
console.log(`wrote ${lines.length - 1} games to ${out} (skipped ${skipped} with unconfirmed GC teams)`);
