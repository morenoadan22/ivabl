// Current season: Fall/Winter 2026. Games are added here as the season is scheduled.
// Summer 2026 final data lives frozen in src/data/archive/summer2026Schedule.js.
export const schedule = [];

export function mapTeamNameToPage(teamName) {
  switch (teamName) {
    case "Aztecas": return "aztecas";
    case "Bullies": return "bullies";
    case "Hot Shotz": return "hot_shotz";
    case "Sandlot": return "sandlot";
    case "Arabes": return "arabes";
    case "Outlaws": return "outlaws";
    case "Los Gringos": return "los_gringos";
    default: return teamName.toLowerCase().replace(/ /g,"_");
  }
}

export function isPlayoffWeek(week) {
  return typeof week.week === "string" && (week.week === "Play-In" || week.week === "Semi-Final" || week.week === "Final");
}
export function isSeededPlaceholder(name) {
  return typeof name === "string" && /^Seed #\d|Winner/i.test(name);
}
