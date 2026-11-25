export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export const COLORS = ['#1f7a5c', '#c2410c', '#0369a1', '#a16207', '#9f1239', '#4d7c0f', '#0f766e', '#b45309'];

const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export function loadProfile() {
  let id = read('nc.id');
  if (!id) { id = crypto.randomUUID(); write('nc.id', id); }
  let color = read('nc.color');
  if (!color) { color = COLORS[Math.floor(Math.random() * COLORS.length)]; write('nc.color', color); }
  return { id, color, name: read('nc.name') || '', emoji: read('nc.emoji') || '', status: read('nc.status') || '' };
}
export const saveName = (n) => write('nc.name', n);
export function saveProfile({ name, emoji, status, color }) {
  write('nc.name', name); write('nc.emoji', emoji); write('nc.status', status); write('nc.color', color);
}

// small localStorage-backed boolean preference
export const loadFlag = (k, fallback = false) => {
  const v = read(`nc.${k}`);
  return v === null ? fallback : v === '1';
};
export const saveFlag = (k, v) => write(`nc.${k}`, v ? '1' : '0');

export const initials = (name) => name.trim().slice(0, 2).toUpperCase();

export const formatDistance = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

export const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const DEFAULT_RADIUS = 1000;
export const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🙏'];

export function loadRadius() {
  const n = Number(read('nc.radius'));
  return n >= 200 && n <= 5000 ? n : DEFAULT_RADIUS;
}
export const saveRadius = (r) => write('nc.radius', String(r));

// blocked users are stored as { [id]: name } so they can be listed and unblocked
export function loadBlocked() {
  try { return JSON.parse(read('nc.blocked') || '{}') || {}; } catch { return {}; }
}
export const saveBlocked = (b) => write('nc.blocked', JSON.stringify(b));

// Stable pseudo-angle from an id. The radar uses this instead of the real
// bearing so it never reveals which direction someone is in.
export function angleFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 3600) / 3600 * Math.PI * 2;
}
