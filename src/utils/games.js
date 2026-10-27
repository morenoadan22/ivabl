// Helpers for season data served by the API (flat game list grouped client-side).

export function isPlayoffWeek(week) {
  return typeof week.week === "string" && (week.week === "Play-In" || week.week === "Quarter-Final" || week.week === "Semi-Final" || week.week === "Final");
}

export function isSeededPlaceholder(name) {
  return typeof name === "string" && /^Seed #\d|Winner/i.test(name);
}

// Flat API games -> [{ week, games }] shaped like the old schedule data.
export function groupGamesByWeek(games) {
  const map = new Map();
  for (const g of games) {
    if (!map.has(g.week)) map.set(g.week, []);
    map.get(g.week).push(g);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0))
    .map(([week, gs]) => ({ week, games: gs }));
}

export function slugForTeam(teams, name) {
  const t = teams.find((x) => x.name === name);
  if (t) return t.slug;
  return String(name || "").toLowerCase().replace(/ /g, "_");
}
