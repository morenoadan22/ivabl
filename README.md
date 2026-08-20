# IVABL — Imperial Valley Adult Baseball League

React rebuild of the IV Men's 2026 Summer wood-bat league site. Originally a static `index.html` + `styles.css` site on Tiiny, now Vite + React + React Router + Tailwind.

Live: `https://ivmensleague.tiiny.site/` (static) → this repo builds to `dist/` for Tiiny

## Stack

- **Vite 8 + React 19 + React Router 7**
- **Tailwind CSS 4** via `@tailwindcss/vite`
- No backend — schedule/rosters/stats are files in `src/data` + `public/stats.csv`
- GameChanger scoreboard widget (`widgets.gc.com`)

## Features

- **Schedule** — Mon–Sun week cards (responsive: 1 col mobile → 2 sm → 7 lg). Empty days hidden on mobile, shown as dashed `—` on desktop. Winner green / loser red, ties amber. Playoff separator. `Sunday 8/23 Championship - Final` lives in the Sunday card (overflow fixed, double-headers separated with `divide-y`).
- **GameChanger Widget** — `src/components/GameChangerWidget.jsx` lazy-loads `sdk.v1.js` and `GC.scoreboard.init({ widgetId: 394d13f8-... })` (250px).
- **Standings** — computed client-side from `schedule` (excludes playoffs, skips `Seed #`/`Winner` placeholders). Sorted W→L→D→RD→RA, PCT `(W+D/3)/G`, top 5 highlighted, RD with `+/-`.
- **Statistics** — parses `public/stats.csv` (GameChanger export) → 12 leaderboards (AVG/QAB/H/HR/RBI/OPS/2B + ERA/W/K/WHIP/BAA). Min PA = team games, pagination 10/page.
- **Team Pages** — `/team/:slug` (aztecas, bullies, hot_shotz, sandlot, arabes, outlaws, los_gringos) — games + roster merged with stats. Handles `Los Grignos` typo in `rosters.json`.
- **Locations** — Stark / Sunflower / Calexico / Central / Brawley (Wiest) with embedded Google Maps.
- **Rules** — 9 rule cards + contact `morenoadan22@gmail.com`.

## Project Structure

```
public/
  img/league_logo.jpeg, img/team/*, facebook-icon.png, favicon.ico
  stats.csv                 # GameChanger export (batting/pitching)
src/
  data/
    schedule.js             # `export const schedule = [...]` + helpers
    rosters.json            # 7 teams (Aztecas etc.)
    teams.js                # team meta + locationMaps
  utils/
    standings.js            # computeStandings()
    stats.js                # processCSVData(), categoryMeta
  components/
    Layout.jsx              # header nav + footer
    GameChangerWidget.jsx
  pages/
    Schedule.jsx            # hero + widget + week cards (Mon-Sun)
    Standings.jsx
    Statistics.jsx
    TeamPage.jsx
    Locations.jsx
    Rules.jsx
  index.css                 # Tailwind + Fraunces/Inter + navy/gold theme
  App.jsx                   # BrowserRouter + Routes
```

## Data Editing

- **Schedule:** `src/data/schedule.js` — array of `{ week: number|"Semi-Final"|"Final", games: [{ date, dayOfWeek, away, home, location, result?{home,away}, description? }] }`. Championship is `{"date":"8/23","dayOfWeek":"Sunday","away":"Winner (Seed #1 vs Winner 4/5)","home":"Aztecas","location":"Calexico","description":"Championship - Final"}`. Helpers `isPlayoffWeek`, `isSeededPlaceholder` control standings/widget filtering.
- **Rosters:** `src/data/rosters.json`
- **Stats:** `public/stats.csv` — re-export from GameChanger, keep header row intact.

## Development

```bash
npm install
npm run dev     # http://localhost:5173/
npm run build   # → dist/ (check with npm run preview)
```

Node 26.7.0 via Homebrew (this Mac). No env vars.

## Deployment (Tiiny)

Tiiny serves a zip's **contents** at the root, not the folder.

```bash
npm run build
# zip the *contents* of dist/ (not dist/ itself)
cd dist && zip -r ../dist.zip . && cd ..
# upload dist.zip to https://tiiny.host → ivmensleague.tiiny.site → Update
```

Every `src/` edit needs a rebuild before re-zipping.

## Git

```bash
git remote add origin git@github.com:morenoadan22/ivabl.git
git push -u origin main
```

`.gitignore` ignores `node_modules/`, `dist/`, `.env*`, logs, `.DS_Store`.

## Notes

- **No DB** — intentionally file-based (Git is the DB). GameChanger is source of truth. If you later need writes (admin editor, radar tracking), migrate to Cloudflare D1 / Turso / Supabase + tiny API — don't go direct AWS/GCP RDS for this scale.
- **Original site** preserved at `Documents/Baseball` for reference.
