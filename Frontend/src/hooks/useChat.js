import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL } from '../lib';

const MAX_PER_THREAD = 200;
const LOCATION_EVERY_MS = 5000;

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

  const socketRef = useRef(null);
  const coordsRef = useRef(coords);
  const activeRef = useRef(active);
  const lastSent = useRef(0);
  coordsRef.current = coords;
  activeRef.current = active;

  const hasFix = !!coords;
  const { id, name, color } = profile;

  useEffect(() => {
    if (!hasFix || !name) return;
    const socket = io(BASE_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const join = () => {
      const c = coordsRef.current;
      socket.emit('join', { id, name, color, lat: c.lat, lng: c.lng }, () => setConnected(true));
    };
    socket.on('connect', join);
    socket.on('disconnect', () => setConnected(false));
    socket.on('replaced', () => { setReplaced(true); socket.disconnect(); });
    socket.on('nearby', (list) => {
      setNearby(list);
      setPeers((p) => { const n = { ...p }; list.forEach((u) => (n[u.id] = u)); return n; });
    });

    const bump = (key) => {
      if (activeRef.current !== key) setUnread((u) => ({ ...u, [key]: (u[key] || 0) + 1 }));
    };
    socket.on('public', (msg) => {
      setPublicMsgs((m) => append(m, msg));
      if (msg.from.id !== id) bump('public');
    });
    socket.on('dm', (msg) => {
      const mine = msg.from.id === id;
      const peerId = mine ? msg.to : msg.from.id;
      if (!mine) setPeers((p) => ({ ...p, [peerId]: { ...p[peerId], ...msg.from } }));
      setDms((d) => ({ ...d, [peerId]: append(d[peerId], msg) }));
      if (!mine) bump(peerId);
    });

    return () => { socket.disconnect(); socketRef.current = null; setConnected(false); };
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

  return { connected, replaced, nearby, publicMsgs, dms, peers, unread, active, open, send };
}
