// Syncs src/data/schedule.js into the umpire SQLite db. Run:
//   DB_PATH=/data/ivabl.db node scripts/sync-games.mjs [--prune]
// Idempotent (INSERT OR REPLACE on a stable game id), so existing claims survive.
// --prune deletes games no longer in the schedule, but never ones with claims.
import { schedule } from "../src/data/schedule.js";
import { openDb, upsertGame } from "../server/db.js";

const db = openDb(process.env.DB_PATH || "./data/ivabl.db");
const ids = new Set();
let n = 0;
for (const week of schedule) {
  for (const g of week.games) {
    ids.add(upsertGame(db, {
      week: week.week,
      date: g.date,
      day_of_week: g.dayOfWeek || "",
      time: g.time,
      away: g.away,
      home: g.home,
      location: g.location,
    }));
    n++;
  }
}
console.log(`synced ${n} games`);
if (process.argv.includes("--prune")) {
  const stale = db.prepare("SELECT id FROM games").all().map((r) => r.id).filter((id) => !ids.has(id));
  let pruned = 0, kept = 0;
  const hasClaims = db.prepare("SELECT 1 FROM claims WHERE game_id = ? LIMIT 1");
  const del = db.prepare("DELETE FROM games WHERE id = ?");
  for (const id of stale) {
    if (hasClaims.get(id)) { kept++; continue; }
    del.run(id);
    pruned++;
  }
  console.log(`pruned ${pruned} removed games (${kept} kept: have claims)`);
}
db.close();
