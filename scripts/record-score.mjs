// Record (or clear) a game result.
// Run: node --env-file=server/.env scripts/record-score.mjs --week 1 --away "Hot Shotz" --home "Dawgz" --away-score 5 --home-score 3
//   or: node --env-file=server/.env scripts/record-score.mjs --game "<id>" --away-score 5 --home-score 3
//   or add --clear to wipe a result.
import { openDb, setScores, listGamesPublic } from "../server/db.js";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const db = openDb(process.env.DB_PATH || "./data/ivabl.db");
let id = flag("--game");
if (!id) {
  const week = Number(flag("--week")), away = flag("--away"), home = flag("--home");
  if (!week || !away || !home) {
    console.error("Usage: --game <id> OR --week N --away <team> --home <team>, with --away-score A --home-score H (or --clear)");
    process.exit(1);
  }
  const g = listGamesPublic(db).find((x) => x.week === week && x.away === away && x.home === home);
  if (!g) {
    console.error("no such game");
    process.exit(1);
  }
  id = g.id;
}
if (args.includes("--clear")) {
  setScores(db, id, null, null);
  console.log(`cleared result for ${id}`);
} else {
  const a = flag("--away-score"), h = flag("--home-score");
  if (a == null || h == null) {
    console.error("provide --away-score and --home-score (or --clear)");
    process.exit(1);
  }
  setScores(db, id, a, h);
  console.log(`recorded ${id}: away ${a} – home ${h}`);
}
db.close();
