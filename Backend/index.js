import 'dotenv/config';
import http from 'http';
import { randomUUID } from 'crypto';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { distanceM, validCoords } from './geo.js';
import { maskProfanity } from './filter.js';

const PORT = process.env.PORT || 4000;
const MIN_RADIUS = 200;
const MAX_RADIUS = Number(process.env.MAX_RADIUS_M) || 5000;
const DEFAULT_RADIUS = Math.min(Number(process.env.DEFAULT_RADIUS_M) || 1000, MAX_RADIUS);
const ORIGINS = (process.env.CLIENT_ORIGINS || 'http://localhost:3000')
  .split(',').map((s) => s.trim()).filter(Boolean);

const MAX_TEXT = 500;
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🙏'];
const REPORTS_TO_MUTE = 3;
const MUTE_MS = 10 * 60 * 1000;
const REPORT_TTL_MS = 60 * 60 * 1000;

const app = express();
app.use(cors({ origin: ORIGINS }));
app.get('/', (_req, res) => res.json({ ok: true, online: users.size, maxRadiusM: MAX_RADIUS }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: ORIGINS, methods: ['GET', 'POST'] } });

// Everything lives in memory. Nothing is stored; a restart clears it all.
const users = new Map(); // id (client generated) -> user
const reports = new Map(); // reportedId -> { reporters:Set, ts }
const muted = new Map(); // id -> until (ms)

const publicUser = (u) => ({ id: u.id, name: u.name, color: u.color, emoji: u.emoji, status: u.status });
const clean = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const segmenter = new Intl.Segmenter();
// accepts exactly one emoji, otherwise ''
const cleanEmoji = (s) => {
  const t = String(s ?? '').trim();
  if (!t || t.length > 16 || [...segmenter.segment(t)].length !== 1) return '';
  return /\p{Extended_Pictographic}/u.test(t) ? t : '';
};
const cleanStatus = (s) => maskProfanity(clean(s, 60));
const clampRadius = (r) => Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, Math.round(Number(r)) || DEFAULT_RADIUS));

// Two people can interact only if neither blocked the other and each is
// inside the smaller of the two chosen radii.
const visible = (a, b) =>
  a.id !== b.id &&
  !a.blocked.has(b.id) && !b.blocked.has(a.id) &&
  distanceM(a, b) <= Math.min(a.radius, b.radius);

const isMuted = (id) => {
  const until = muted.get(id);
  if (!until) return false;
  if (until <= Date.now()) { muted.delete(id); return false; }
  return true;
};

// scope is 'public' or a user id (DM)
function audience(me, scope) {
  if (scope === 'public') return [...users.values()].filter((u) => visible(me, u));
  const t = users.get(scope);
  return t && visible(me, t) ? [t] : [];
}

function nearbyOf(me) {
  const out = [];
  for (const u of users.values()) {
    if (!visible(me, u)) continue;
    out.push({ ...publicUser(u), distance: Math.max(10, Math.round(distanceM(me, u) / 10) * 10) });
  }
  return out.sort((a, b) => a.distance - b.distance);
}

// Debounced so a burst of updates only triggers one fan-out.
let refreshTimer = null;
function scheduleRefresh() {
  if (refreshTimer) return;
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    for (const u of users.values()) io.to(u.socketId).emit('nearby', nearbyOf(u));
  }, 250);
}

setInterval(() => {
  const now = Date.now();
  for (const [id, r] of reports) if (now - r.ts > REPORT_TTL_MS) reports.delete(id);
}, 10 * 60 * 1000).unref();

const limiter = (count, windowMs) => {
  let hits = [];
  return () => {
    const now = Date.now();
    hits = hits.filter((t) => now - t < windowMs);
    if (hits.length >= count) return true;
    hits.push(now);
    return false;
  };
};

io.on('connection', (socket) => {
  let me = null;
  const msgLimited = limiter(6, 5000);
  const lightLimited = limiter(30, 5000);
  const reportLimited = limiter(5, 60000);

  socket.on('join', (p = {}, ack) => {
    const lat = Number(p.lat), lng = Number(p.lng);
    const name = clean(p.name, 20);
    if (!name || !validCoords(lat, lng)) return ack?.({ ok: false, error: 'Invalid name or location' });

    const id = clean(p.id, 64) || randomUUID();
    const old = users.get(id);
    if (old && old.socketId !== socket.id) io.to(old.socketId).emit('replaced');

    const blocked = new Set(
      (Array.isArray(p.blocked) ? p.blocked : []).slice(0, 200).map((b) => clean(b, 64)).filter(Boolean)
    );
    me = {
      id, socketId: socket.id, name, lat, lng, blocked,
      color: clean(p.color, 16) || '#1f7a5c',
      emoji: cleanEmoji(p.emoji),
      status: cleanStatus(p.status),
      radius: clampRadius(p.radius ?? DEFAULT_RADIUS),
    };
    users.set(id, me);
    ack?.({ ok: true, me: publicUser(me), radius: me.radius, minRadius: MIN_RADIUS, maxRadius: MAX_RADIUS, reactions: REACTIONS });
    scheduleRefresh();
  });

  socket.on('profile', (p = {}, ack) => {
    if (!me || lightLimited()) return;
    const name = clean(p.name, 20);
    if (name.length < 2) return ack?.({ ok: false, error: 'Nickname must be at least 2 characters' });
    me.name = name;
    me.emoji = cleanEmoji(p.emoji);
    me.status = cleanStatus(p.status);
    me.color = clean(p.color, 16) || me.color;
    ack?.({ ok: true, me: publicUser(me) });
    scheduleRefresh();
  });

  socket.on('location', (p = {}) => {
    if (!me) return;
    const lat = Number(p.lat), lng = Number(p.lng);
    if (!validCoords(lat, lng)) return;
    me.lat = lat; me.lng = lng;
    scheduleRefresh();
  });

  socket.on('radius', (p = {}) => {
    if (!me) return;
    me.radius = clampRadius(p.radius);
    scheduleRefresh();
  });

  socket.on('block', (p = {}) => {
    if (!me) return;
    const id = clean(p.id, 64);
    if (!id || id === me.id) return;
    if (p.on) { if (me.blocked.size < 200) me.blocked.add(id); } else me.blocked.delete(id);
    scheduleRefresh();
  });

  socket.on('public', (p = {}, ack) => {
    if (!me) return;
    const text = maskProfanity(clean(p.text, MAX_TEXT));
    if (!text) return;
    if (isMuted(me.id)) return ack?.({ ok: false, error: 'You are muted for a few minutes after reports' });
    if (msgLimited()) return ack?.({ ok: false, error: 'Slow down a little' });

    const msg = { id: randomUUID(), from: publicUser(me), text, ts: Date.now() };
    for (const u of audience(me, 'public')) io.to(u.socketId).emit('public', msg);
    io.to(me.socketId).emit('public', msg);
    ack?.({ ok: true });
  });

  socket.on('dm', (p = {}, ack) => {
    if (!me) return;
    const text = maskProfanity(clean(p.text, MAX_TEXT));
    if (!text) return;
    if (isMuted(me.id)) return ack?.({ ok: false, error: 'You are muted for a few minutes after reports' });
    const [target] = audience(me, clean(p.to, 64));
    if (!target) return ack?.({ ok: false, error: 'User is no longer in range' });
    if (msgLimited()) return ack?.({ ok: false, error: 'Slow down a little' });

    const msg = { id: randomUUID(), from: publicUser(me), to: target.id, text, ts: Date.now() };
    io.to(target.socketId).emit('dm', msg);
    io.to(me.socketId).emit('dm', msg);
    ack?.({ ok: true });
  });

  socket.on('typing', (p = {}) => {
    if (!me || lightLimited() || isMuted(me.id)) return;
    const scope = clean(p.scope, 64);
    const on = !!p.on;
    for (const u of audience(me, scope)) {
      // each recipient sees the thread from their own side
      io.to(u.socketId).emit('typing', { from: publicUser(me), scope: scope === 'public' ? 'public' : me.id, on });
    }
  });

  socket.on('react', (p = {}) => {
    if (!me || lightLimited()) return;
    const emoji = String(p.emoji);
    const msgId = clean(p.msgId, 64);
    if (!REACTIONS.includes(emoji) || !msgId) return;
    const ev = { msgId, emoji, from: me.id, on: !!p.on };
    for (const u of audience(me, clean(p.scope, 64))) io.to(u.socketId).emit('react', ev);
    io.to(me.socketId).emit('react', ev);
  });

  socket.on('report', (p = {}, ack) => {
    if (!me) return;
    const id = clean(p.id, 64);
    if (!id || id === me.id) return ack?.({ ok: false });
    if (reportLimited()) return ack?.({ ok: false, error: 'Too many reports, try later' });

    console.log('REPORT', JSON.stringify({
      reported: id, by: me.id, reason: clean(p.reason, 40), text: clean(p.text, 200), at: new Date().toISOString(),
    }));
    const r = reports.get(id) || { reporters: new Set(), ts: Date.now() };
    r.reporters.add(me.id); r.ts = Date.now();
    reports.set(id, r);
    if (r.reporters.size >= REPORTS_TO_MUTE) {
      muted.set(id, Date.now() + MUTE_MS);
      reports.delete(id);
      console.log('MUTED', id);
    }
    ack?.({ ok: true });
  });

  socket.on('disconnect', () => {
    if (me && users.get(me.id)?.socketId === socket.id) {
      users.delete(me.id);
      scheduleRefresh();
    }
  });
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT} (default ${DEFAULT_RADIUS} m, max ${MAX_RADIUS} m)`));
