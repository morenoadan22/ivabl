// Imports src/data/rosters.json into the db (replaces each team's roster).
// Run: node --env-file=server/.env scripts/import-rosters.mjs
import { readFileSync } from "node:fs";
import { teams } from "../src/data/teams.js";
import { openDb, replaceRoster } from "../server/db.js";

const rosters = JSON.parse(readFileSync(new URL("../src/data/rosters.json", import.meta.url)));
const db = openDb(process.env.DB_PATH || "./data/ivabl.db");
let n = 0;
for (const t of teams) {
  // handle historical typo in rosters.json
  const entries = rosters[t.name]
    || (t.slug === "los_gringos" ? rosters["Los Grignos"] : null)
    || [];
  replaceRoster(db, t.slug, entries.map((p) => ({
    number: p.number, first_name: p.firstName, last_name: p.lastName,
  })));
  n += entries.length;
}
console.log(`imported ${n} roster entries across ${teams.length} teams`);
db.close();
