// Create an umpire (name-only login) or an admin (issued a secret code).
// Optional profile flags: --first, --last, --facebook, --phone, --payment.
// Run: DB_PATH=/data/ivabl.db node scripts/create-umpire.mjs "Full Name" [--admin] [--first Ada --phone ...]
import { openDb, createUmpire, updateUmpire } from "../server/db.js";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const name = args.find((a) => !a.startsWith("--"));
const role = args.includes("--admin") ? "admin" : "umpire";
if (!name) {
  console.error('Usage: node scripts/create-umpire.mjs "Full Name" [--admin] [--first F --last L --facebook URL --phone P --payment M]');
  process.exit(1);
}
const profile = {
  first_name: flag("--first"),
  last_name: flag("--last"),
  facebook_url: flag("--facebook"),
  phone: flag("--phone"),
  payment: flag("--payment"),
};
for (const k of Object.keys(profile)) if (profile[k] == null) delete profile[k];

const db = openDb(process.env.DB_PATH || "./data/ivabl.db");
const row = createUmpire(db, name, role);
if (Object.keys(profile).length) updateUmpire(db, row.id, profile);
db.close();
if (role === "admin") {
  console.log(`Created admin #${row.id}: ${row.name}\nLogin code (share once, store safely): ${row.code}`);
} else {
  console.log(`Created umpire #${row.id}: ${row.name} (logs in with name only, no code)`);
}
