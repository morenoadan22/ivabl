// Imports src/data/teams.js into the umpire SQLite db (idempotent).
// Run: node --env-file=server/.env scripts/import-teams.mjs
import { teams } from "../src/data/teams.js";
import { openDb, upsertTeam } from "../server/db.js";

const db = openDb(process.env.DB_PATH || "./data/ivabl.db");
for (const t of teams) upsertTeam(db, t);
console.log(`imported ${teams.length} teams`);
db.close();
