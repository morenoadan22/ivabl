// Bulk-create umpire accounts (name-only login). Splits each name into
// first/last profile fields (first word + remainder).
// Run: node --env-file=server/.env scripts/import-umpires.mjs umpires.txt
//   or: node --env-file=server/.env scripts/import-umpires.mjs "Full Name" "Another Name" [...]
import { readFileSync, existsSync } from "node:fs";
import { openDb, createUmpire, updateUmpire } from "../server/db.js";

const args = process.argv.slice(2);
let names;
if (args.length === 1 && existsSync(args[0])) {
  names = readFileSync(args[0], "utf8").split("\n");
} else if (args.length > 0 && !args.some((a) => a.startsWith("--"))) {
  names = args;
} else {
  console.error("Usage: node scripts/import-umpires.mjs umpires.txt\n   or: node scripts/import-umpires.mjs \"Full Name\" [...]");
  process.exit(1);
}

const db = openDb(process.env.DB_PATH || "./data/ivabl.db");
let created = 0, skipped = 0;
for (const raw of names) {
  const name = raw.trim();
  if (!name) continue;
  try {
    const row = createUmpire(db, name, "umpire");
    const [first, ...rest] = name.split(/\s+/);
    updateUmpire(db, row.id, { first_name: first, last_name: rest.join(" ") });
    console.log(`Created umpire #${row.id}: ${name}`);
    created++;
  } catch (e) {
    if (/UNIQUE/.test(e.message)) {
      console.log(`Skipped (already exists): ${name}`);
      skipped++;
    } else throw e;
  }
}
console.log(`done: ${created} created, ${skipped} skipped`);
db.close();
