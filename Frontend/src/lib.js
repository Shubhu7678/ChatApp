export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const COLORS = ['#1f7a5c', '#c2410c', '#0369a1', '#a16207', '#9f1239', '#4d7c0f', '#0f766e', '#b45309'];

const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export function loadProfile() {
  let id = read('nc.id');
  if (!id) { id = crypto.randomUUID(); write('nc.id', id); }
  let color = read('nc.color');
  if (!color) { color = COLORS[Math.floor(Math.random() * COLORS.length)]; write('nc.color', color); }
  return { id, color, name: read('nc.name') || '' };
}
export const saveName = (n) => write('nc.name', n);

export const initials = (name) => name.trim().slice(0, 2).toUpperCase();

export const formatDistance = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

export const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
