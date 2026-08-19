export const ITEMS_PER_PAGE = 10;

function getTeamGamesPlayed(schedule) {
  const m = {};
  for (const w of schedule) {
    for (const g of w.games) {
      if (g.result) {
        m[g.home] = (m[g.home]||0)+1;
        m[g.away] = (m[g.away]||0)+1;
      }
    }
  }
  return m;
}

function parseCSVLine(line) {
  const result=[]; let cur=''; let inQuotes=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"') inQuotes=!inQuotes;
    else if(c===',' && !inQuotes){ result.push(cur); cur=''; }
    else cur+=c;
  }
  result.push(cur); return result;
}

export function processCSVData(csvData, schedule) {
  const rows = csvData.trim().split('\n');
  const headers = parseCSVLine(rows[0]);
  const aggregatedData={};
  const teamGames = getTeamGamesPlayed(schedule);
  const playerTeamGames={};

  for(let i=1;i<rows.length;i++){
    const values = parseCSVLine(rows[i]);
    const pd={};
    headers.forEach((h,idx)=> pd[h.trim()] = (values[idx]||'').trim());
    const firstName = pd['First Name']||'';
    const lastName = pd['Last Name']||'';
    const playerName = `${firstName} ${lastName}`.trim();
    if(!playerName) continue;
    const gamesPlayed = parseInt(pd['Games Played'])||0;
    const plateAppearances = parseInt(pd['Plate Appearances'])||0;
    const hits = parseInt(pd['Hits'])||0;
    const doubles = parseInt(pd['Doubles'])||0;
    const triples = parseInt(pd['Triples'])||0;
    const homeRuns = parseInt(pd['Home Runs'])||0;
    const rbi = parseInt(pd['Runs Batted In'])||0;
    const qualityAB = parseInt(pd['Quality At-Bats'])||0;
    const battingAvg = parseFloat(pd['Batting Average'])||0;
    const obp = parseFloat(pd['On-base Percentage'])||0;
    const slg = parseFloat(pd['Slugging Percentage'])||0;
    let atBats=0;
    if(battingAvg>0 && hits>0) atBats = Math.round(hits / battingAvg);
    else if(battingAvg===0 && plateAppearances>0) atBats=plateAppearances;
    const singles = Math.max(0, hits - doubles - triples - homeRuns);
    const totalBases = singles + doubles*2 + triples*3 + homeRuns*4;
    const inningsPitched = parseFloat(pd['Innings Pitched'])||0;
    const era = parseFloat(pd['Earned Run Average']);
    const wins = parseInt(pd['Wins'])||0;
    const strikeouts = parseInt(pd['Strikeouts'])||0;
    const whip = parseFloat(pd['Walks Hits Innings Pitched']);
    const baa = parseFloat(pd['Batting Average Against']);
    let earnedRuns=0;
    if(!isNaN(era) && inningsPitched>0) earnedRuns = (era*inningsPitched)/9;
    const walksHits = !isNaN(whip) && inningsPitched>0 ? whip*inningsPitched : 0;
    const baaWeighted = !isNaN(baa) && inningsPitched>0 ? baa*inningsPitched : 0;

    const team = (pd['Team']||'').trim();
    if(!team) continue;

    // track per-player team counts
    if(!playerTeamGames[playerName]) playerTeamGames[playerName]={};
    playerTeamGames[playerName][team] = (playerTeamGames[playerName][team]||0)+(gamesPlayed||1);

    if(!aggregatedData[playerName]){
      aggregatedData[playerName]={
        name: playerName, team,
        gamesPlayed, plateAppearances, atBats, hits, doubles, triples, homeRuns, rbi, qualityAtBats: qualityAB,
        totalBases, battingAverage: battingAvg, obp, slg, ops: 0,
        inningsPitched, earnedRuns, wins, strikeouts, walksHits, baaWeighted,
        era: NaN, whip: NaN, baa: NaN
      };
    } else {
      const p=aggregatedData[playerName];
      p.gamesPlayed = Math.max(p.gamesPlayed, gamesPlayed);
      p.plateAppearances += plateAppearances;
      // recompute atBats accum? keep max
      if(atBats>p.atBats) p.atBats=atBats;
      p.hits += hits; p.doubles+=doubles; p.triples+=triples; p.homeRuns+=homeRuns; p.rbi+=rbi; p.qualityAtBats+=qualityAB;
      p.totalBases += totalBases;
      p.inningsPitched += inningsPitched;
      p.earnedRuns += earnedRuns; p.wins+=wins; p.strikeouts+=strikeouts; p.walksHits+=walksHits; p.baaWeighted+=baaWeighted;
    }
  }

  Object.keys(aggregatedData).forEach(k=>{
    const p=aggregatedData[k];
    const tm = playerTeamGames[k];
    if(tm){
      let max=0, primary=p.team;
      for(const [team, games] of Object.entries(tm)) if(games>max){ max=games; primary=team; }
      p.team=primary;
    }
    if(p.atBats>0) p.battingAverage = p.hits / p.atBats;
    if(p.atBats>0){
      const slg = p.totalBases / p.atBats;
      const estOBP = p.plateAppearances>0 ? (p.hits + (p.plateAppearances - p.atBats))/p.plateAppearances : p.battingAverage;
      p.ops = estOBP + slg;
    }
    if(p.inningsPitched>0){
      p.era = (p.earnedRuns*9)/p.inningsPitched;
      p.whip = p.walksHits / p.inningsPitched;
      p.baa = p.baaWeighted / p.inningsPitched;
    }
  });

  const meetsMinPA = (pl)=>{
    const teamGameCount = teamGames[pl.team]||0;
    const minPA = 1*teamGameCount;
    return pl.plateAppearances >= minPA;
  };

  return {
    battingAverage: Object.values(aggregatedData).filter(p=>p.battingAverage>0 && meetsMinPA(p)).sort((a,b)=>b.battingAverage-a.battingAverage),
    qualityAtBats: Object.values(aggregatedData).filter(p=>p.qualityAtBats>0).sort((a,b)=>b.qualityAtBats-a.qualityAtBats),
    hits: Object.values(aggregatedData).filter(p=>p.hits>0).sort((a,b)=>b.hits-a.hits),
    homeRuns: Object.values(aggregatedData).filter(p=>p.homeRuns>0).sort((a,b)=>b.homeRuns-a.homeRuns),
    rbi: Object.values(aggregatedData).filter(p=>p.rbi>0).sort((a,b)=>b.rbi-a.rbi),
    ops: Object.values(aggregatedData).filter(p=>p.ops>0 && meetsMinPA(p)).sort((a,b)=>b.ops-a.ops),
    doubles: Object.values(aggregatedData).filter(p=>p.doubles>0).sort((a,b)=>b.doubles-a.doubles),
    era: Object.values(aggregatedData).filter(p=>!isNaN(p.era)&&p.inningsPitched>0).sort((a,b)=>a.era-b.era),
    wins: Object.values(aggregatedData).filter(p=>p.wins>0).sort((a,b)=>b.wins-a.wins),
    strikeouts: Object.values(aggregatedData).filter(p=>p.strikeouts>0).sort((a,b)=>b.strikeouts-a.strikeouts),
    whip: Object.values(aggregatedData).filter(p=>!isNaN(p.whip)&&p.inningsPitched>0).sort((a,b)=>a.whip-b.whip),
    baa: Object.values(aggregatedData).filter(p=>!isNaN(p.baa)&&p.inningsPitched>0).sort((a,b)=>a.baa-b.baa),
  };
}

export const categoryMeta = {
  battingAverage: { title: 'Batting Average', key: 'battingAverage', fmt: v=>v.toFixed(3) },
  qualityAtBats: { title: 'Quality At-Bats', key: 'qualityAtBats', fmt: v=>v },
  hits: { title: 'Hits', key: 'hits', fmt: v=>v },
  homeRuns: { title: 'Home Runs', key: 'homeRuns', fmt: v=>v },
  rbi: { title: 'RBI', key: 'rbi', fmt: v=>v },
  ops: { title: 'OPS', key: 'ops', fmt: v=>v.toFixed(3) },
  doubles: { title: 'Doubles', key: 'doubles', fmt: v=>v },
  era: { title: 'ERA', key: 'era', fmt: v=>v.toFixed(2) },
  wins: { title: 'Wins', key: 'wins', fmt: v=>v },
  strikeouts: { title: 'Strikeouts', key: 'strikeouts', fmt: v=>v },
  whip: { title: 'WHIP', key: 'whip', fmt: v=>v.toFixed(2) },
  baa: { title: 'BAA', key: 'baa', fmt: v=>v.toFixed(3) },
};
