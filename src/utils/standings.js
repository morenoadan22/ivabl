import { isPlayoffWeek, isSeededPlaceholder } from "../data/schedule.js";

export function computeStandings(schedule) {
  const teams = {};
  for (const week of schedule) {
    if (isPlayoffWeek(week)) continue;
    for (const game of week.games) {
      const home = game.home;
      const away = game.away;
      if (isSeededPlaceholder(home) || isSeededPlaceholder(away)) continue;
      if (!teams[home]) teams[home] = { wins: 0, losses: 0, draws: 0, rs: 0, ra: 0 };
      if (!teams[away]) teams[away] = { wins: 0, losses: 0, draws: 0, rs: 0, ra: 0 };
      if (game.result) {
        const hs = game.result.home;
        const as = game.result.away;
        if (hs > as) { teams[home].wins++; teams[away].losses++; }
        else if (hs < as) { teams[home].losses++; teams[away].wins++; }
        else { teams[home].draws++; teams[away].draws++; }
        teams[home].rs += hs; teams[home].ra += as;
        teams[away].rs += as; teams[away].ra += hs;
      }
    }
  }
  const sorted = Object.keys(teams).sort((a,b)=>{
    if (teams[a].wins !== teams[b].wins) return teams[b].wins - teams[a].wins;
    if (teams[a].losses !== teams[b].losses) return teams[a].losses - teams[b].losses;
    if (teams[a].draws !== teams[b].draws) return teams[b].draws - teams[a].draws;
    const rdA = teams[a].rs - teams[a].ra;
    const rdB = teams[b].rs - teams[b].ra;
    if (rdA !== rdB) return rdB - rdA;
    return teams[a].ra - teams[b].ra;
  });
  return sorted.map((name, idx)=>{
    const t = teams[name];
    const gp = t.wins + t.losses + t.draws;
    const pct = gp === 0 ? 0 : (t.wins + t.draws/3) / gp;
    return { rank: idx+1, name, ...t, pct, rd: t.rs - t.ra };
  });
}
