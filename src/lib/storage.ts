export const STORAGE_KEYS = {
  CONFIG: 'sp2026_config_v1',
  DAYS: 'sp2026_days_v1',
  ATTRACTIONS: 'sp2026_attractions_v1',
  STOPS: 'sp2026_stops_v1',
  BUDGET: 'sp2026_budget_v1',
  PERSONAL_BUDGET: 'sp2026_personal_budget_v1',
  TRANSPORT: 'sp2026_transport_v1',
  CHECKLIST: 'sp2026_checklist_v1',
  RSVPS: 'sp2026_rsvps_v1',
  STOP_VOTES: 'sp2026_stop_votes_v1',
  PLACE_LIKES: 'sp2026_place_likes_v1',
  VOTER_NAME: 'sp2026_voter_name_v1',
  DEVICE_TOKEN: 'sp2026_device_token_v1',
  USER_PREFS: 'sp2026_user_prefs_v1',
};

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignora cota excedida ou navegação privada restrita
  }
}
