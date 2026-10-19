// Current season: Fall/Winter 2026. Games are added here as the season is scheduled.
// Summer 2026 final data lives frozen in src/data/archive/summer2026Schedule.js.
export const schedule = [
  {
    "week": 1,
    "games": [
      {
        "date": "10/31",
        "dayOfWeek": "Saturday",
        "time": "9:00 AM",
        "away": "Aztecas",
        "home": "Hot Shotz",
        "location": "Stark"
      },
      {
        "date": "10/31",
        "dayOfWeek": "Saturday",
        "time": "12:30 PM",
        "away": "Sandlot",
        "home": "SBC",
        "location": "Central"
      },
      {
        "date": "10/31",
        "dayOfWeek": "Saturday",
        "time": "9:00 AM",
        "away": "Impact",
        "home": "Calexico Baseball",
        "location": "Calexico"
      },
      {
        "date": "10/31",
        "dayOfWeek": "Saturday",
        "time": "12:30 PM",
        "away": "Los Gringos",
        "home": "Arabes",
        "location": "Stark"
      },
      {
        "date": "10/31",
        "dayOfWeek": "Saturday",
        "time": "9:00 AM",
        "away": "Dawgz",
        "home": "Outlaws",
        "location": "Sunflower"
      }
    ]
  }
];

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
