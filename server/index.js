import express from "express";
import {
  openDb, verifyUmpire, createSession, getSession, deleteSession,
  requestClaim, withdrawClaim, decideClaim, assignUmpire, reopenClaim, listGamesWithClaims,
  myClaims, pendingQueue, coverage, workload, publicRoster,
  updateUmpire, adminRoster, ownProfile,
  listTeams, getTeam, listGamesPublic, teamGames, setScores,
  replaceRoster, listRoster, replaceStatLines, statLinesToCsv,
} from "./db.js";

const db = openDb(process.env.DB_PATH || "./ivabl.db");
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:5173";
export const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "512kb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", APP_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function readToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/(?:^|;\s*)ivabl_session=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function session(req, _res, next) {
  req.session = getSession(db, readToken(req));
  next();
}

function requireLogin(req, res, next) {
  if (!req.session) return res.status(401).json({ error: "login required" });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session) return res.status(401).json({ error: "login required" });
  if (req.session.role !== "admin") return res.status(403).json({ error: "admin required" });
  next();
}

function sessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `ivabl_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=2592000`);
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "ivabl_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/umpires", (_req, res) => res.json(publicRoster(db)));

// Public season data
app.get("/api/teams", (_req, res) => res.json(listTeams(db)));

app.get("/api/teams/:slug", (req, res) => {
  const team = getTeam(db, req.params.slug);
  if (!team) return res.status(404).json({ error: "unknown team" });
  res.json({ team, roster: listRoster(db, team.slug), games: teamGames(db, team.name) });
});

app.get("/api/season/games", (_req, res) => res.json(listGamesPublic(db)));

app.get("/api/stats.csv", (_req, res) => {
  res.setHeader("Content-Type", "text/csv");
  res.send(statLinesToCsv(db));
});

// Admin season data
app.put("/api/admin/games/:id/scores", session, requireAdmin, (req, res) => {
  try {
    setScores(db, req.params.id, req.body?.away_score, req.body?.home_score);
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/admin/stats", session, requireAdmin, (req, res) => {
  try {
    const csv = req.body?.csv;
    if (typeof csv !== "string") return res.status(400).json({ error: "csv text required" });
    // Reuse the import mapping: header name -> column.
    const parseLine = (line) => {
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
    };
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
    const text = csv.trim();
    if (!text) return res.status(400).json({ error: "empty csv" });
    const lines = text.split("\n");
    const headers = parseLine(lines[0]).map((h) => h.trim());
    if (!headers.includes("First Name") || !headers.includes("Team")) {
      return res.status(400).json({ error: "csv must have First Name and Team columns" });
    }
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
    res.json({ ok: true, lines: n });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.put("/api/admin/rosters/:slug", session, requireAdmin, (req, res) => {
  try {
    if (!Array.isArray(req.body?.entries)) return res.status(400).json({ error: "entries array required" });
    replaceRoster(db, req.params.slug, req.body.entries);
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/login", (req, res) => {
  const { name, code } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const user = verifyUmpire(db, name, code);
  if (!user) return res.status(401).json({ error: "unknown name or wrong code" });
  const token = createSession(db, user.id, user.role);
  sessionCookie(res, token);
  res.json({ token, id: user.id, name: user.name, role: user.role });
});

app.post("/api/logout", session, (req, res) => {
  if (req.session) deleteSession(db, req.session.token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/me", session, (req, res) => {
  if (!req.session) return res.json(null);
  res.json({ id: req.session.umpire_id, name: req.session.name, role: req.session.role });
});

app.get("/api/games", session, requireLogin, (req, res) => {
  res.json(listGamesWithClaims(db, req.session.umpire_id));
});

app.get("/api/my-claims", session, requireLogin, (req, res) => {
  res.json(myClaims(db, req.session.umpire_id));
});

app.post("/api/claims", session, requireLogin, (req, res) => {
  try {
    const id = requestClaim(db, req.session.umpire_id, req.body?.game_id);
    res.status(201).json({ id });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.delete("/api/claims/:id", session, requireLogin, (req, res) => {
  try {
    withdrawClaim(db, req.session.umpire_id, Number(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/admin/queue", session, requireAdmin, (_req, res) => {
  res.json(pendingQueue(db));
});

app.post("/api/admin/claims/:id/decision", session, requireAdmin, (req, res) => {
  try {
    decideClaim(db, Number(req.params.id), req.body?.approve === true);
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/admin/claims/:id/reopen", session, requireAdmin, (req, res) => {
  try {
    reopenClaim(db, Number(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/admin/assignments", session, requireAdmin, (req, res) => {
  try {
    const claimId = assignUmpire(db, req.body?.game_id, Number(req.body?.umpire_id));
    res.json({ ok: true, claim_id: claimId });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/admin/coverage", session, requireAdmin, (_req, res) => {
  res.json(coverage(db));
});

app.get("/api/admin/workload", session, requireAdmin, (_req, res) => {
  res.json(workload(db));
});

app.get("/api/profile", session, requireLogin, (req, res) => {
  res.json(ownProfile(db, req.session.umpire_id));
});

app.put("/api/profile", session, requireLogin, (req, res) => {
  try {
    updateUmpire(db, req.session.umpire_id, req.body || {});
    res.json(ownProfile(db, req.session.umpire_id));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/admin/umpires", session, requireAdmin, (_req, res) => {
  res.json(adminRoster(db));
});

app.put("/api/admin/umpires/:id", session, requireAdmin, (req, res) => {
  try {
    updateUmpire(db, Number(req.params.id), req.body || {});
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

const port = Number(process.env.PORT || 3001);
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`umpire api on :${port}`));
}
