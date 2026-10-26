// Syncs src/data/schedule.js into the umpire SQLite db. Run:
//   DB_PATH=/data/ivabl.db node scripts/sync-games.mjs
// Idempotent (INSERT OR REPLACE on a stable game id), so existing claims survive.
import { schedule } from "../src/data/schedule.js";
import { openDb, upsertGame } from "../server/db.js";

const db = openDb(process.env.DB_PATH || "./data/ivabl.db");
let n = 0;
for (const week of schedule) {
  for (const g of week.games) {
    upsertGame(db, {
      week: week.week,
      date: g.date,
      day_of_week: g.dayOfWeek || "",
      time: g.time,
      away: g.away,
      home: g.home,
      location: g.location,
    });
    n++;
  }
}
console.log(`synced ${n} games`);
db.close();
