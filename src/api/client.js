const BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "ivabl_token";

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // private mode: sessions last for the tab via in-memory fallback
    memToken = token;
  }
}

let memToken = null;

async function request(path, options = {}) {
  const token = memToken || getToken();
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (res.status === 401) {
    setToken(null);
    memToken = null;
    window.dispatchEvent(new CustomEvent("ivabl:unauthorized"));
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) throw new Error(body?.error || `request failed (${res.status})`);
  return body;
}

export const api = {
  health: () => request("/api/health"),
  roster: () => request("/api/umpires"),
  login: async (name, code) => {
    const me = await request("/api/login", {
      method: "POST",
      body: JSON.stringify(code ? { name, code } : { name }),
    });
    if (me?.token) {
      memToken = null;
      setToken(me.token);
    }
    return me;
  },
  logout: async () => {
    try {
      await request("/api/logout", { method: "POST", body: "{}" });
    } finally {
      memToken = null;
      setToken(null);
    }
  },
  me: () => request("/api/me"),
  seasonTeams: () => request("/api/teams"),
  seasonTeam: (slug) => request(`/api/teams/${slug}`),
  seasonGames: () => request("/api/season/games"),
  seasonStatsCsv: async () => {
    const res = await fetch(`${BASE}/api/stats.csv`, { credentials: "include" });
    if (!res.ok) throw new Error(`stats request failed (${res.status})`);
    return res.text();
  },
  saveScores: (id, away_score, home_score) =>
    request(`/api/admin/games/${encodeURIComponent(id)}/scores`, {
      method: "PUT",
      body: JSON.stringify({ away_score, home_score }),
    }),
  uploadStats: (csv) =>
    request("/api/admin/stats", { method: "POST", body: JSON.stringify({ csv }) }),
  profile: () => request("/api/profile"),
  saveProfile: (fields) => request("/api/profile", { method: "PUT", body: JSON.stringify(fields) }),
  adminUmpires: () => request("/api/admin/umpires"),
  saveUmpire: (id, fields) =>
    request(`/api/admin/umpires/${id}`, { method: "PUT", body: JSON.stringify(fields) }),
  games: () => request("/api/games"),
  myClaims: () => request("/api/my-claims"),
  claim: (game_id) =>
    request("/api/claims", { method: "POST", body: JSON.stringify({ game_id }) }),
  withdraw: (id) => request(`/api/claims/${id}`, { method: "DELETE" }),
  queue: () => request("/api/admin/queue"),
  decide: (id, approve) =>
    request(`/api/admin/claims/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ approve }),
    }),
  assign: (game_id, umpire_id) =>
    request("/api/admin/assignments", {
      method: "POST",
      body: JSON.stringify({ game_id, umpire_id }),
    }),
  unassign: (id) => request(`/api/admin/claims/${id}`, { method: "DELETE" }),
  coverage: () => request("/api/admin/coverage"),
  workload: () => request("/api/admin/workload"),
};
