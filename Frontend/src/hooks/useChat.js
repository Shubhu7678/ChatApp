import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL, loadRadius, saveRadius, loadBlocked, saveBlocked } from '../lib';

const MAX_PER_THREAD = 200;
const LOCATION_EVERY_MS = 5000;
const TYPING_TTL_MS = 4000;

const append = (list = [], msg) => [...list, msg].slice(-MAX_PER_THREAD);

export default function useChat(profile, coords) {
  const [connected, setConnected] = useState(false);
  const [replaced, setReplaced] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [publicMsgs, setPublicMsgs] = useState([]);
  const [dms, setDms] = useState({}); // peerId -> messages
  const [peers, setPeers] = useState({}); // peerId -> {id,name,color}
  const [unread, setUnread] = useState({}); // 'public' | peerId -> count
  const [active, setActive] = useState('public');
  const [radius, setRadiusState] = useState(loadRadius);
  const [limits, setLimits] = useState({ min: 200, max: 5000 });
  const [blocked, setBlocked] = useState(loadBlocked); // id -> name
  const [typing, setTyping] = useState({}); // scope -> { userId: name }
  const [reactions, setReactions] = useState({}); // msgId -> { emoji: [userIds] }

  const socketRef = useRef(null);
  const coordsRef = useRef(coords);
  const activeRef = useRef(active);
  const radiusRef = useRef(radius);
  const blockedRef = useRef(blocked);
  const reactionsRef = useRef(reactions);
  const typingTimers = useRef({});
  const radiusTimer = useRef(null);
  const lastSent = useRef(0);
  coordsRef.current = coords;
  activeRef.current = active;
  radiusRef.current = radius;
  blockedRef.current = blocked;
  reactionsRef.current = reactions;

  const hasFix = !!coords;
  const { id, name, color } = profile;

  useEffect(() => {
    if (!hasFix || !name) return;
    const socket = io(BASE_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const join = () => {
      const c = coordsRef.current;
      socket.emit('join', {
        id, name, color, lat: c.lat, lng: c.lng,
        radius: radiusRef.current, blocked: Object.keys(blockedRef.current),
      }, (res) => {
        if (!res?.ok) return;
        setLimits({ min: res.minRadius, max: res.maxRadius });
        setConnected(true);
      });
    };
    socket.on('connect', join);
    socket.on('disconnect', () => setConnected(false));
    socket.on('replaced', () => { setReplaced(true); socket.disconnect(); });
    socket.on('nearby', (list) => {
      setNearby(list);
      setPeers((p) => { const n = { ...p }; list.forEach((u) => (n[u.id] = u)); return n; });
    });

    const isBlocked = (uid) => uid in blockedRef.current;
    const bump = (key) => {
      if (activeRef.current !== key) setUnread((u) => ({ ...u, [key]: (u[key] || 0) + 1 }));
    };
    const clearTyping = (scope, uid) => {
      clearTimeout(typingTimers.current[`${scope}:${uid}`]);
      setTyping((t) => {
        if (!t[scope]?.[uid]) return t;
        const { [uid]: _gone, ...rest } = t[scope];
        return { ...t, [scope]: rest };
      });
    };

    socket.on('public', (msg) => {
      if (isBlocked(msg.from.id)) return;
      setPublicMsgs((m) => append(m, msg));
      clearTyping('public', msg.from.id);
      if (msg.from.id !== id) bump('public');
    });
    socket.on('dm', (msg) => {
      const mine = msg.from.id === id;
      const peerId = mine ? msg.to : msg.from.id;
      if (!mine && isBlocked(peerId)) return;
      if (!mine) setPeers((p) => ({ ...p, [peerId]: { ...p[peerId], ...msg.from } }));
      setDms((d) => ({ ...d, [peerId]: append(d[peerId], msg) }));
      if (!mine) { clearTyping(peerId, peerId); bump(peerId); }
    });

    socket.on('typing', ({ from, scope, on }) => {
      if (isBlocked(from.id)) return;
      if (!on) return clearTyping(scope, from.id);
      setTyping((t) => ({ ...t, [scope]: { ...t[scope], [from.id]: from.name } }));
      const key = `${scope}:${from.id}`;
      clearTimeout(typingTimers.current[key]);
      typingTimers.current[key] = setTimeout(() => clearTyping(scope, from.id), TYPING_TTL_MS);
    });

    socket.on('react', ({ msgId, emoji, from, on }) => {
      if (isBlocked(from)) return;
      setReactions((r) => {
        const cur = (r[msgId]?.[emoji] || []).filter((u) => u !== from);
        const next = { ...r[msgId], [emoji]: on ? [...cur, from] : cur };
        if (!next[emoji].length) delete next[emoji];
        return { ...r, [msgId]: next };
      });
    });

    const timers = typingTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
      socket.disconnect(); socketRef.current = null; setConnected(false);
    };
  }, [hasFix, id, name, color]);

  // Throttled location updates after the first join.
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !connected || !coords) return;
    const now = Date.now();
    if (now - lastSent.current < LOCATION_EVERY_MS) return;
    lastSent.current = now;
    s.emit('location', { lat: coords.lat, lng: coords.lng });
  }, [coords, connected]);

  const open = useCallback((key) => {
    setActive(key);
    setUnread((u) => (u[key] ? { ...u, [key]: 0 } : u));
  }, []);

  const send = useCallback((key, text) => new Promise((resolve) => {
    const s = socketRef.current;
    if (!s) return resolve({ ok: false, error: 'Not connected' });
    const ev = key === 'public' ? 'public' : 'dm';
    const payload = key === 'public' ? { text } : { to: key, text };
    s.timeout(5000).emit(ev, payload, (err, res) => resolve(err ? { ok: false, error: 'No response' } : res || { ok: true }));
  }), []);

  const setRadius = useCallback((r) => {
    setRadiusState(r);
    saveRadius(r);
    clearTimeout(radiusTimer.current);
    radiusTimer.current = setTimeout(() => socketRef.current?.emit('radius', { radius: r }), 300);
  }, []);

  const sendTyping = useCallback((scope, on) => {
    socketRef.current?.emit('typing', { scope, on });
  }, []);

  const react = useCallback((msgId, scope, emoji) => {
    const already = (reactionsRef.current[msgId]?.[emoji] || []).includes(id);
    socketRef.current?.emit('react', { msgId, scope, emoji, on: !already });
  }, [id]);

  const block = useCallback((user) => {
    setBlocked((b) => { const n = { ...b, [user.id]: user.name }; saveBlocked(n); return n; });
    socketRef.current?.emit('block', { id: user.id, on: true });
    if (activeRef.current === user.id) open('public');
  }, [open]);

  const unblock = useCallback((uid) => {
    setBlocked((b) => { const { [uid]: _gone, ...n } = b; saveBlocked(n); return n; });
    socketRef.current?.emit('block', { id: uid, on: false });
  }, []);

  const report = useCallback((user, text, reason) => new Promise((resolve) => {
    const s = socketRef.current;
    if (!s) return resolve({ ok: false });
    s.timeout(5000).emit('report', { id: user.id, text, reason }, (err, res) => resolve(err ? { ok: false } : res || { ok: true }));
  }), []);

  return {
    connected, replaced, nearby, publicMsgs, dms, peers, unread, active, open, send,
    radius, limits, setRadius, blocked, block, unblock, report,
    typing, sendTyping, reactions, react,
  };
}
