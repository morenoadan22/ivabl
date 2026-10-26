import test from "node:test";
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import {
  openDb, createUmpire, verifyUmpire, createSession, getSession, deleteSession,
  upsertGame, requestClaim, withdrawClaim, decideClaim, listGamesWithClaims,
  myClaims, pendingQueue, coverage, workload, publicRoster,
  updateUmpire, adminRoster, ownProfile,
  upsertTeam, listTeams, getTeam, teamGames, setScores, replaceRoster, listRoster,
  replaceStatLines, statLinesToCsv, listGamesPublic,
} from "./db.js";

function setup() {
  const db = openDb(":memory:");
  const a = createUmpire(db, "Ump One");
  const b = createUmpire(db, "Ump Two");
  const admin = createUmpire(db, "Boss", "admin");
  const g1 = upsertGame(db, { week: 1, date: "10/31", dayOfWeek: "Saturday", time: "9:00 AM", away: "A", home: "B", location: "Stark" });
  const g2 = upsertGame(db, { week: 1, date: "10/31", dayOfWeek: "Saturday", time: "12:30 PM", away: "C", home: "D", location: "Sunflower" });
  return { db, a, b, admin, g1, g2 };
}

test("umpires log in with name only; admins require their code", () => {
  const { db, a, admin } = setup();
  assert.equal(verifyUmpire(db, a.name).name, "Ump One");
  assert.equal(verifyUmpire(db, a.name, "ANYTHING").name, "Ump One"); // code ignored for name-only accounts
  assert.equal(verifyUmpire(db, "Nobody"), null);
  assert.equal(verifyUmpire(db, admin.name), null); // code required
  assert.equal(verifyUmpire(db, admin.name, "WRONG1"), null);
  assert.equal(verifyUmpire(db, admin.name, admin.code).role, "admin");
});

test("admin codes are stored hashed, never plaintext", () => {
  const { db, a, admin } = setup();
  const row = db.prepare("SELECT code_hash, code_salt FROM umpires WHERE id = ?").get(admin.id);
  assert.match(row.code_hash, /^[0-9a-f]{64}$/);
  assert.ok(!row.code_hash.includes(admin.code));
  const ump = db.prepare("SELECT code_hash FROM umpires WHERE id = ?").get(a.id);
  assert.equal(ump.code_hash, ""); // name-only: no secret stored
});

test("sessions round-trip and logout kills them", () => {
  const { db, a } = setup();
  const token = createSession(db, a.id, "umpire");
  assert.equal(getSession(db, token).name, "Ump One");
  deleteSession(db, token);
  assert.equal(getSession(db, token), null);
  assert.equal(getSession(db, "bogus"), null);
});

test("request/withdraw claim lifecycle", () => {
  const { db, a, g1 } = setup();
  const id = requestClaim(db, a.id, g1);
  assert.throws(() => requestClaim(db, a.id, g1), /already claimed/);
  assert.equal(myClaims(db, a.id).length, 1);
  withdrawClaim(db, a.id, id);
  assert.equal(myClaims(db, a.id).length, 0);
  assert.throws(() => requestClaim(db, a.id, "nope"), /unknown game/);
});

test("approve auto-denies rival pending claims; decided claims are final", () => {
  const { db, a, b, g1 } = setup();
  const idA = requestClaim(db, a.id, g1);
  const idB = requestClaim(db, b.id, g1);
  decideClaim(db, idA, true);
  const rows = db.prepare("SELECT id, status FROM claims ORDER BY id").all();
  assert.deepEqual(rows.map((r) => r.status), ["approved", "denied"]);
  assert.deepEqual(pendingQueue(db), []);
  assert.throws(() => decideClaim(db, idB, true), /already decided/);
});

test("first approval that week drops the umpire's other pending claims; second approval blocked", () => {
  const { db, a, g1, g2 } = setup();
  const idA1 = requestClaim(db, a.id, g1);
  const idA2 = requestClaim(db, a.id, g2);
  decideClaim(db, idA1, true);
  const rows = db.prepare("SELECT id, status FROM claims ORDER BY id").all();
  assert.deepEqual(rows.map((r) => r.status), ["approved", "denied"]);
  assert.throws(() => decideClaim(db, idA2, true), /already decided/);
  const g3 = upsertGame(db, { week: 1, date: "11/1", dayOfWeek: "Saturday", time: "9:00 AM", away: "E", home: "F", location: "Stark" });
  const idA3 = requestClaim(db, a.id, g3);
  assert.throws(() => decideClaim(db, idA3, true), /already has an approved game that week/);
  const g4 = upsertGame(db, { week: 2, date: "11/8", dayOfWeek: "Saturday", time: "9:00 AM", away: "E", home: "F", location: "Stark" });
  const idA4 = requestClaim(db, a.id, g4);
  decideClaim(db, idA4, true); // different week: allowed
  assert.equal(db.prepare("SELECT status FROM claims WHERE id = ?").get(idA4).status, "approved");
});

test("myClaims and queue expose the numeric claim id (not the game id)", () => {
  const { db, a, g1 } = setup();
  const id = requestClaim(db, a.id, g1);
  assert.equal(myClaims(db, a.id)[0].id, id);
  assert.equal(pendingQueue(db)[0].id, id);
  withdrawClaim(db, a.id, myClaims(db, a.id)[0].id); // the exposed id must work
  assert.equal(myClaims(db, a.id).length, 0);
});

test("deny leaves the game open for others", () => {
  const { db, a, b, g1 } = setup();
  const idA = requestClaim(db, a.id, g1);
  decideClaim(db, idA, false);
  const idB = requestClaim(db, b.id, g1);
  assert.ok(idB);
});

test("coverage flags uncovered games; workload counts per umpire", () => {
  const { db, a, g1, g2 } = setup();
  const id = requestClaim(db, a.id, g1);
  decideClaim(db, id, true);
  const cov = coverage(db);
  assert.equal(cov.find((g) => g.id === g1).approved_umpire, "Ump One");
  assert.equal(cov.find((g) => g.id === g2).approved_umpire, null);
  const wl = workload(db);
  assert.equal(wl.find((r) => r.name === "Ump One").approved, 1);
});

test("profile fields round-trip; unknown fields ignored; unknown umpire 404s", () => {
  const { db, a } = setup();
  updateUmpire(db, a.id, {
    first_name: "Ada", last_name: "Martinez", facebook_url: "https://facebook.com/ada",
    phone: "(760) 555-0100", payment: "Zelle", role: "admin", bogus: 1,
  });
  const p = ownProfile(db, a.id);
  assert.equal(p.first_name, "Ada");
  assert.equal(p.last_name, "Martinez");
  assert.equal(p.payment, "Zelle");
  assert.equal(verifyUmpire(db, a.name).role, "umpire"); // role not editable via profile
  const all = adminRoster(db).find((u) => u.id === a.id);
  assert.equal(all.phone, "(760) 555-0100");
  assert.throws(() => updateUmpire(db, 9999, { phone: "x" }), /not found/);
});

test("openDb migrates databases created before the profile columns", async () => {
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = mkdtempSync(join(tmpdir(), "ivabl-"));
  try {
    const legacy = join(dir, "legacy.db");
    const raw = new Database(legacy);
    raw.exec(`CREATE TABLE umpires (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, code_hash TEXT NOT NULL,
      code_salt TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'umpire', active INTEGER NOT NULL DEFAULT 1
    )`);
    raw.exec("INSERT INTO umpires (name, code_hash, code_salt) VALUES ('Old', '', '')");
    raw.close();
    const db = openDb(legacy); // must add the missing columns instead of failing
    const cols = db.prepare("PRAGMA table_info(umpires)").all().map((c) => c.name);
    for (const c of ["first_name", "last_name", "facebook_url", "phone", "payment"]) {
      assert.ok(cols.includes(c));
    }
    updateUmpire(db, 1, { first_name: "Old", phone: "x" });
    assert.equal(ownProfile(db, 1).phone, "x");
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("teams/roster/scores round-trip; score validation", () => {
  const { db, g1 } = setup();
  upsertTeam(db, { slug: "az", name: "Aztecas", division: "AA", manager: "Skip" });
  upsertTeam(db, { slug: "hz", name: "Hot Shotz" });
  assert.equal(listTeams(db).length, 2);
  assert.equal(getTeam(db, "az").manager, "Skip");
  assert.equal(getTeam(db, "nope"), null);
  replaceRoster(db, "az", [{ number: "3", first_name: "A", last_name: "B" }, {}]);
  assert.deepEqual(listRoster(db, "az"), [{ number: "3", firstName: "A", lastName: "B" }]);
  assert.throws(() => replaceRoster(db, "nope", []), /unknown team/);
  const gid = g1;
  setScores(db, gid, 8, 5);
  assert.deepEqual(listGamesPublic(db).find((g) => g.id === gid).result, { away: 8, home: 5 });
  setScores(db, gid, null, null);
  assert.equal(listGamesPublic(db).find((g) => g.id === gid).result, undefined);
  assert.throws(() => setScores(db, gid, 1, null), /both scores/);
  assert.throws(() => setScores(db, gid, -1, 2), /non-negative/);
  assert.throws(() => setScores(db, "nope", 1, 2), /not found/);
  const n = replaceStatLines(db, [
    { first_name: "T", last_name: "U", team: "Aztecas", games_played: 4, hits: 6, batting_average: 0.375 },
  ]);
  assert.equal(n, 1);
  const csv = statLinesToCsv(db);
  assert.ok(csv.startsWith("First Name,Last Name,"));
  assert.ok(csv.includes("T,U,,Aztecas,4,"));
  assert.equal(teamGames(db, "Nope").length, 0);
});

test("public roster exposes names only", () => {
  const { db } = setup();
  for (const u of publicRoster(db)) {
    assert.deepEqual(Object.keys(u).sort(), ["id", "name"]);
  }
});
