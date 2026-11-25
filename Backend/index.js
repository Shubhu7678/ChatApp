import 'dotenv/config';
import http from 'http';
import { randomUUID } from 'crypto';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { distanceM, validCoords } from './geo.js';

const PORT = process.env.PORT || 4000;
const RADIUS_M = Number(process.env.RADIUS_M) || 1000;
const ORIGINS = (process.env.CLIENT_ORIGINS || 'http://localhost:3000')
  .split(',').map((s) => s.trim()).filter(Boolean);

const MAX_TEXT = 500;
const RATE_LIMIT = { count: 6, windowMs: 5000 };

const app = express();
app.use(cors({ origin: ORIGINS }));
app.get('/', (_req, res) => res.json({ ok: true, online: users.size, radiusM: RADIUS_M }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: ORIGINS, methods: ['GET', 'POST'] } });

// Everything lives in memory. Nothing is stored; a restart clears it all.
// id (client generated, persisted in the browser) -> user
const users = new Map();

const publicUser = (u) => ({ id: u.id, name: u.name, color: u.color });
const clean = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

function nearbyOf(me) {
  const out = [];
  for (const u of users.values()) {
    if (u.id === me.id) continue;
    const d = distanceM(me, u);
    if (d <= RADIUS_M) out.push({ ...publicUser(u), distance: Math.max(10, Math.round(d / 10) * 10) });
  }
  return out.sort((a, b) => a.distance - b.distance);
}

// Debounced so a burst of location updates only triggers one fan-out.
let refreshTimer = null;
function scheduleRefresh() {
  if (refreshTimer) return;
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    for (const u of users.values()) io.to(u.socketId).emit('nearby', nearbyOf(u));
  }, 250);
}

io.on('connection', (socket) => {
  let me = null;
  let sent = [];

  const limited = () => {
    const now = Date.now();
    sent = sent.filter((t) => now - t < RATE_LIMIT.windowMs);
    if (sent.length >= RATE_LIMIT.count) return true;
    sent.push(now);
    return false;
  };

  socket.on('join', (p = {}, ack) => {
    const lat = Number(p.lat), lng = Number(p.lng);
    const name = clean(p.name, 20);
    if (!name || !validCoords(lat, lng)) return ack?.({ ok: false, error: 'Invalid name or location' });

    const id = clean(p.id, 64) || randomUUID();
    const old = users.get(id);
    if (old && old.socketId !== socket.id) io.to(old.socketId).emit('replaced');

    me = { id, socketId: socket.id, name, color: clean(p.color, 16) || '#1f7a5c', lat, lng };
    users.set(id, me);
    ack?.({ ok: true, me: publicUser(me), radius: RADIUS_M });
    scheduleRefresh();
  });

  socket.on('location', (p = {}) => {
    if (!me) return;
    const lat = Number(p.lat), lng = Number(p.lng);
    if (!validCoords(lat, lng)) return;
    me.lat = lat; me.lng = lng;
    scheduleRefresh();
  });

  socket.on('public', (p = {}, ack) => {
    if (!me) return;
    const text = clean(p.text, MAX_TEXT);
    if (!text) return;
    if (limited()) return ack?.({ ok: false, error: 'Slow down a little' });

    const msg = { id: randomUUID(), from: publicUser(me), text, ts: Date.now() };
    // Delivered to everyone inside the radius *right now*, plus the sender.
    for (const u of users.values()) {
      if (u.id === me.id || distanceM(me, u) <= RADIUS_M) io.to(u.socketId).emit('public', msg);
    }
    ack?.({ ok: true });
  });

  socket.on('dm', (p = {}, ack) => {
    if (!me) return;
    const text = clean(p.text, MAX_TEXT);
    const target = users.get(clean(p.to, 64));
    if (!text || !target) return ack?.({ ok: false, error: 'User is no longer online' });
    if (distanceM(me, target) > RADIUS_M) return ack?.({ ok: false, error: 'User moved out of range' });
    if (limited()) return ack?.({ ok: false, error: 'Slow down a little' });

    const msg = { id: randomUUID(), from: publicUser(me), to: target.id, text, ts: Date.now() };
    io.to(target.socketId).emit('dm', msg);
    io.to(me.socketId).emit('dm', msg);
    ack?.({ ok: true });
  });

  socket.on('disconnect', () => {
    if (me && users.get(me.id)?.socketId === socket.id) {
      users.delete(me.id);
      scheduleRefresh();
    }
  });
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT} (radius ${RADIUS_M} m)`));
