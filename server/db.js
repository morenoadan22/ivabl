import Database from "better-sqlite3";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCode(length = 6) {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

function hashCode(code, salt) {
  return scryptSync(code.toUpperCase().trim(), salt, 32).toString("hex");
}

export function openDb(path) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS umpires (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code_hash TEXT NOT NULL,
      code_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'umpire',
      active INTEGER NOT NULL DEFAULT 1,
      first_name TEXT,
      last_name TEXT,
      facebook_url TEXT,
      phone TEXT,
      payment TEXT
    );
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      week INTEGER NOT NULL,
      date TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      time TEXT NOT NULL,
      away TEXT NOT NULL,
      home TEXT NOT NULL,
      location TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY,
      game_id TEXT NOT NULL REFERENCES games(id),
      umpire_id INTEGER NOT NULL REFERENCES umpires(id),
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      decided_at TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      umpire_id INTEGER NOT NULL REFERENCES umpires(id),
      role TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS teams (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      division TEXT,
      image TEXT,
      image_alt TEXT,
      manager TEXT,
      manager_url TEXT,
      manager2 TEXT,
      manager2_url TEXT,
      guest INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS roster_entries (
      id INTEGER PRIMARY KEY,
      team_slug TEXT NOT NULL REFERENCES teams(slug),
      number TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stat_lines (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      jersey TEXT,
      team TEXT NOT NULL,
      games_played INTEGER NOT NULL DEFAULT 0,
      plate_appearances INTEGER NOT NULL DEFAULT 0,
      innings_pitched REAL NOT NULL DEFAULT 0,
      batting_average REAL,
      quality_at_bats INTEGER NOT NULL DEFAULT 0,
      hits INTEGER NOT NULL DEFAULT 0,
      doubles INTEGER NOT NULL DEFAULT 0,
      triples INTEGER NOT NULL DEFAULT 0,
      home_runs INTEGER NOT NULL DEFAULT 0,
      rbi INTEGER NOT NULL DEFAULT 0,
      obp REAL,
      slg REAL,
      era REAL,
      wins INTEGER NOT NULL DEFAULT 0,
      strikeouts INTEGER NOT NULL DEFAULT 0,
      whip REAL,
      baa REAL
    );
  `);
  // Migrate scores onto databases created before results tracking.
  const gameCols = new Set(
    db.prepare("PRAGMA table_info(games)").all().map((c) => c.name)
  );
  for (const col of ["away_score", "home_score"]) {
    if (!gameCols.has(col)) db.exec(`ALTER TABLE games ADD COLUMN ${col} INTEGER`);
  }
  // Migrate databases created before the profile columns existed.
  const cols = new Set(
    db.prepare("PRAGMA table_info(umpires)").all().map((c) => c.name)
  );
  for (const col of ["first_name", "last_name", "facebook_url", "phone", "payment"]) {
    if (!cols.has(col)) db.exec(`ALTER TABLE umpires ADD COLUMN ${col} TEXT`);
  }
  return db;
}

export const PROFILE_FIELDS = ["first_name", "last_name", "facebook_url", "phone", "payment"];

export function updateUmpire(db, id, fields) {
  const sets = [], vals = [];
  for (const f of PROFILE_FIELDS) {
    if (fields[f] !== undefined) {
      sets.push(`${f} = ?`);
      vals.push(String(fields[f] ?? "").slice(0, 500));
    }
  }
  if (!sets.length) return;
  vals.push(id);
  const info = db.prepare(`UPDATE umpires SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  if (info.changes === 0) throw Object.assign(new Error("not found"), { status: 404 });
}

export function adminRoster(db) {
  return db.prepare(
    `SELECT id, name, role, active, first_name, last_name, facebook_url, phone, payment
     FROM umpires ORDER BY name`
  ).all();
}

export function ownProfile(db, umpireId) {
  return db.prepare(
    `SELECT id, name, first_name, last_name, facebook_url, phone, payment
     FROM umpires WHERE id = ?`
  ).get(umpireId);
}

export function createUmpire(db, name, role = "umpire", code = null) {
  // Umpires are name-only (empty code_hash). Admins always get a secret code.
  if (role === "admin" && !code) code = generateCode();
  let salt = "", hash = "";
  if (code) {
    salt = randomBytes(16).toString("hex");
    hash = hashCode(code, salt);
  }
  const stmt = db.prepare(
    "INSERT INTO umpires (name, code_hash, code_salt, role) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(name.trim(), hash, salt, role);
  return { id: Number(info.lastInsertRowid), name: name.trim(), code };
}

export function verifyUmpire(db, name, code) {
  const row = db.prepare("SELECT * FROM umpires WHERE name = ? AND active = 1").get(name.trim());
  if (!row) return null;
  if (!row.code_hash) return { id: row.id, name: row.name, role: row.role }; // name-only account
  if (!code) return null;
  const hashed = Buffer.from(hashCode(code, row.code_salt), "hex");
  const stored = Buffer.from(row.code_hash, "hex");
  if (hashed.length !== stored.length || !timingSafeEqual(hashed, stored)) return null;
  return { id: row.id, name: row.name, role: row.role };
}

export function createSession(db, umpireId, role, days = 30) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + days * 864e5).toISOString().slice(0, 19).replace("T", " ");
  db.prepare("INSERT INTO sessions (token, umpire_id, role, expires_at) VALUES (?, ?, ?, ?)").run(
    token, umpireId, role, expires
  );
  return token;
}

export function getSession(db, token) {
  if (!token) return null;
  const row = db.prepare(
    `SELECT s.token, s.role, s.expires_at, u.id AS umpire_id, u.name, u.active
     FROM sessions s JOIN umpires u ON u.id = s.umpire_id
     WHERE s.token = ?`
  ).get(token);
  if (!row || !row.active) return null;
  if (new Date(row.expires_at + "Z") < new Date()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return row;
}

export function deleteSession(db, token) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function upsertGame(db, game) {
  const id = [game.week, game.date, game.time, game.location, game.away, game.home].join("|");
  db.prepare(
    `INSERT INTO games (id, week, date, day_of_week, time, away, home, location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET away = excluded.away, home = excluded.home`
  ).run(id, game.week, game.date, game.day_of_week ?? game.dayOfWeek ?? "", game.time, game.away, game.home, game.location);
  return id;
}

export function requestClaim(db, umpireId, gameId) {
  const game = db.prepare("SELECT id FROM games WHERE id = ?").get(gameId);
  if (!game) throw Object.assign(new Error("unknown game"), { status: 404 });
  const dup = db.prepare("SELECT id FROM claims WHERE game_id = ? AND umpire_id = ? AND status != 'denied'").get(gameId, umpireId);
  if (dup) throw Object.assign(new Error("already claimed"), { status: 409 });
  const info = db.prepare("INSERT INTO claims (game_id, umpire_id) VALUES (?, ?)").run(gameId, umpireId);
  return Number(info.lastInsertRowid);
}

export function withdrawClaim(db, umpireId, claimId) {
  const row = db.prepare("SELECT * FROM claims WHERE id = ? AND umpire_id = ?").get(claimId, umpireId);
  if (!row) throw Object.assign(new Error("not found"), { status: 404 });
  if (row.status !== "pending") throw Object.assign(new Error("only pending claims can be withdrawn"), { status: 409 });
  db.prepare("DELETE FROM claims WHERE id = ?").run(claimId);
}

export function decideClaim(db, claimId, approve) {
  const row = db.prepare("SELECT * FROM claims WHERE id = ?").get(claimId);
  if (!row) throw Object.assign(new Error("not found"), { status: 404 });
  if (row.status !== "pending") throw Object.assign(new Error("already decided"), { status: 409 });
  const week = db.prepare("SELECT week FROM games WHERE id = ?").get(row.game_id)?.week;
  if (approve && week !== undefined) {
    const existing = db.prepare(
      `SELECT c.id FROM claims c JOIN games g ON g.id = c.game_id
       WHERE c.umpire_id = ? AND c.status = 'approved' AND g.week = ?`
    ).get(row.umpire_id, week);
    if (existing) {
      throw Object.assign(new Error("umpire already has an approved game that week"), { status: 409 });
    }
  }
  const decide = db.transaction(() => {
    db.prepare("UPDATE claims SET status = ?, decided_at = datetime('now') WHERE id = ?").run(
      approve ? "approved" : "denied", claimId
    );
    if (approve) {
      db.prepare(
        "UPDATE claims SET status = 'denied', decided_at = datetime('now') WHERE game_id = ? AND id != ? AND status = 'pending'"
      ).run(row.game_id, claimId);
      // One game per umpire per week: first approval drops their other pending requests that week.
      if (week !== undefined) {
        db.prepare(
          `UPDATE claims SET status = 'denied', decided_at = datetime('now')
           WHERE umpire_id = ? AND status = 'pending' AND id != ?
           AND game_id IN (SELECT id FROM games WHERE week = ?)`
        ).run(row.umpire_id, claimId, week);
      }
    }
  });
  decide();
}

export function listGamesWithClaims(db, umpireId) {
  return db.prepare(
    `SELECT g.*,
       (SELECT id FROM claims WHERE game_id = g.id AND umpire_id = ? AND status != 'denied') AS my_claim_id,
       (SELECT status FROM claims WHERE game_id = g.id AND umpire_id = ? AND status != 'denied') AS my_claim_status,
       (SELECT COUNT(*) FROM claims WHERE game_id = g.id AND status = 'approved') AS approved_count,
       (SELECT COUNT(*) FROM claims WHERE game_id = g.id AND status = 'pending' AND umpire_id != ?) AS other_pending
     FROM games g ORDER BY g.week, g.date, g.time`
  ).all(umpireId, umpireId, umpireId);
}

export function myClaims(db, umpireId) {
  return db.prepare(
    `SELECT c.id, c.status, c.created_at, g.id AS game_id,
            g.week, g.date, g.day_of_week, g.time, g.away, g.home, g.location
     FROM claims c JOIN games g ON g.id = c.game_id
     WHERE c.umpire_id = ? ORDER BY g.week, g.date, g.time`
  ).all(umpireId);
}

export function pendingQueue(db) {
  return db.prepare(
    `SELECT c.id, c.status, c.created_at, u.name AS umpire, g.id AS game_id,
            g.week, g.date, g.day_of_week, g.time, g.away, g.home, g.location FROM claims c
     JOIN games g ON g.id = c.game_id JOIN umpires u ON u.id = c.umpire_id
     WHERE c.status = 'pending' ORDER BY g.week, g.date, g.time`
  ).all();
}

export function coverage(db) {
  return db.prepare(
    `SELECT g.*, a.name AS approved_umpire FROM games g
     LEFT JOIN claims c ON c.game_id = g.id AND c.status = 'approved'
     LEFT JOIN umpires a ON a.id = c.umpire_id
     ORDER BY g.week, g.date, g.time`
  ).all().map((g) => ({ ...gameRow(g), approved_umpire: g.approved_umpire }));
}

export function workload(db) {
  return db.prepare(
    `SELECT u.name, COUNT(CASE WHEN c.status = 'approved' THEN 1 END) AS approved,
            COUNT(CASE WHEN c.status = 'pending' THEN 1 END) AS pending
     FROM umpires u LEFT JOIN claims c ON c.umpire_id = u.id
     WHERE u.role = 'umpire' AND u.active = 1 GROUP BY u.id ORDER BY u.name`
  ).all();
}

export function publicRoster(db) {
  return db.prepare("SELECT id, name FROM umpires WHERE role = 'umpire' AND active = 1 ORDER BY name").all();
}

// ---- Season data (teams, results, rosters, stats) ----

export function upsertTeam(db, t) {
  db.prepare(
    `INSERT INTO teams (slug, name, division, image, image_alt, manager, manager_url, manager2, manager2_url, guest)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET name = excluded.name, division = excluded.division,
       image = excluded.image, image_alt = excluded.image_alt, manager = excluded.manager,
       manager_url = excluded.manager_url, manager2 = excluded.manager2,
       manager2_url = excluded.manager2_url, guest = excluded.guest`
  ).run(
    t.slug, t.name, t.division || null, t.image || null, t.imageAlt || null,
    t.manager || null, t.managerUrl || null, t.manager2 || null, t.manager2Url || null,
    t.guest ? 1 : 0
  );
}

function teamRow(t) {
  if (!t) return null;
  return {
    slug: t.slug, name: t.name, division: t.division, image: t.image, imageAlt: t.image_alt,
    manager: t.manager, managerUrl: t.manager_url, manager2: t.manager2, manager2Url: t.manager2_url,
    guest: !!t.guest,
  };
}

export function listTeams(db) {
  return db.prepare("SELECT * FROM teams ORDER BY name").all().map(teamRow);
}

export function getTeam(db, slug) {
  return teamRow(db.prepare("SELECT * FROM teams WHERE slug = ?").get(slug));
}

export function gameRow(g) {
  if (!g) return null;
  const out = {
    id: g.id, week: g.week, date: g.date, dayOfWeek: g.day_of_week, time: g.time,
    away: g.away, home: g.home, location: g.location,
  };
  if (g.away_score !== null && g.away_score !== undefined &&
      g.home_score !== null && g.home_score !== undefined) {
    out.result = { away: g.away_score, home: g.home_score };
  }
  return out;
}

export function listGamesPublic(db) {
  return db.prepare("SELECT * FROM games ORDER BY week, date, time").all().map(gameRow);
}

export function teamGames(db, teamName) {
  return db.prepare(
    "SELECT * FROM games WHERE away = ? OR home = ? ORDER BY week, date, time"
  ).all(teamName, teamName).map(gameRow);
}

export function setScores(db, gameId, awayScore, homeScore) {
  const norm = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) throw Object.assign(new Error("scores must be non-negative integers"), { status: 400 });
    return n;
  };
  const a = norm(awayScore), h = norm(homeScore);
  if ((a === null) !== (h === null)) {
    throw Object.assign(new Error("set both scores or neither (both empty clears the result)"), { status: 400 });
  }
  const info = db.prepare("UPDATE games SET away_score = ?, home_score = ? WHERE id = ?").run(a, h, gameId);
  if (info.changes === 0) throw Object.assign(new Error("not found"), { status: 404 });
}

export function replaceRoster(db, slug, entries) {
  const team = getTeam(db, slug);
  if (!team) throw Object.assign(new Error("unknown team"), { status: 404 });
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM roster_entries WHERE team_slug = ?").run(slug);
    const ins = db.prepare(
      "INSERT INTO roster_entries (team_slug, number, first_name, last_name) VALUES (?, ?, ?, ?)"
    );
    for (const e of entries) {
      if (!e.first_name && !e.last_name) continue;
      ins.run(slug, e.number || null, (e.first_name || "").slice(0, 100), (e.last_name || "").slice(0, 100));
    }
  });
  tx();
}

export function listRoster(db, slug) {
  return db.prepare(
    "SELECT number, first_name AS firstName, last_name AS lastName FROM roster_entries WHERE team_slug = ? ORDER BY last_name, first_name"
  ).all(slug);
}

// Canonical GameChanger-style header for CSV export; the client parses by name.
export const STAT_CSV_HEADERS = [
  "First Name", "Last Name", "Jersey Number", "Team", "Games Played", "Plate Appearances",
  "Innings Pitched", "Batting Average", "Quality At-Bats", "Hits", "Doubles", "Triples",
  "Home Runs", "Runs Batted In", "On-base Percentage", "Slugging Percentage", "Earned Run Average",
  "Wins", "Strikeouts", "Walks Hits Innings Pitched", "Batting Average Against",
];

const STAT_COLS = [
  "first_name", "last_name", "jersey", "team", "games_played", "plate_appearances",
  "innings_pitched", "batting_average", "quality_at_bats", "hits", "doubles", "triples",
  "home_runs", "rbi", "obp", "slg", "era", "wins", "strikeouts", "whip", "baa",
];

export function replaceStatLines(db, rows) {
  const num = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM stat_lines").run();
    const ins = db.prepare(
      `INSERT INTO stat_lines (${STAT_COLS.join(", ")}) VALUES (${STAT_COLS.map(() => "?").join(", ")})`
    );
    for (const r of rows) {
      if (!r.first_name && !r.last_name) continue;
      ins.run(
        (r.first_name || "").slice(0, 100), (r.last_name || "").slice(0, 100),
        (r.jersey || "").slice(0, 10), (r.team || "").slice(0, 100),
        num(r.games_played) || 0, num(r.plate_appearances) || 0, num(r.innings_pitched) || 0,
        num(r.batting_average), num(r.quality_at_bats) || 0, num(r.hits) || 0,
        num(r.doubles) || 0, num(r.triples) || 0, num(r.home_runs) || 0, num(r.rbi) || 0,
        num(r.obp), num(r.slg), num(r.era), num(r.wins) || 0, num(r.strikeouts) || 0,
        num(r.whip), num(r.baa)
      );
    }
  });
  tx();
  return db.prepare("SELECT COUNT(*) AS n FROM stat_lines").get().n;
}

export function statLinesToCsv(db) {
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = db.prepare(`SELECT ${STAT_COLS.join(", ")} FROM stat_lines`).all();
  const lines = [STAT_CSV_HEADERS.join(",")];
  for (const r of rows) lines.push(STAT_COLS.map((c) => esc(r[c])).join(","));
  return lines.join("\n") + "\n";
}
