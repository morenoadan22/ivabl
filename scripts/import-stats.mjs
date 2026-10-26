// Imports a GameChanger-style stats CSV (default public/stats.csv) into the db.
// Replaces all stat lines. Run: node --env-file=server/.env scripts/import-stats.mjs [path.csv]
import { readFileSync } from "node:fs";
import { openDb, replaceStatLines } from "../server/db.js";

function parseLine(line) {
  const out = [];
  let cur = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const COLUMNS = {
  "First Name": "first_name", "Last Name": "last_name", "Jersey Number": "jersey",
  "Team": "team", "Games Played": "games_played", "Plate Appearances": "plate_appearances",
  "Innings Pitched": "innings_pitched", "Batting Average": "batting_average",
  "Quality At-Bats": "quality_at_bats", "Hits": "hits", "Doubles": "doubles",
  "Triples": "triples", "Home Runs": "home_runs", "Runs Batted In": "rbi",
  "On-base Percentage": "obp", "Slugging Percentage": "slg", "Earned Run Average": "era",
  "Wins": "wins", "Strikeouts": "strikeouts", "Walks Hits Innings Pitched": "whip",
  "Batting Average Against": "baa",
};

const path = process.argv[2] || new URL("../public/stats.csv", import.meta.url);
const text = readFileSync(path, "utf8").trim();
const db = openDb(process.env.DB_PATH || "./data/ivabl.db");
if (!text) {
  replaceStatLines(db, []);
  console.log("imported 0 stat lines (empty csv)");
  db.close();
  process.exit(0);
}
const lines = text.split("\n");
const headers = parseLine(lines[0]).map((h) => h.trim());
const rows = lines.slice(1).filter((l) => l.trim()).map((line) => {
  const vals = parseLine(line);
  const row = {};
  headers.forEach((h, i) => {
    const key = COLUMNS[h];
    if (key) row[key] = (vals[i] || "").trim();
  });
  return row;
});
const n = replaceStatLines(db, rows);
console.log(`imported ${n} stat lines`);
db.close();
