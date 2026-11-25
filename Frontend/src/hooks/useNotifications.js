import { useCallback, useEffect, useRef, useState } from 'react';
import { loadFlag, saveFlag } from '../lib';

const supported = typeof Notification !== 'undefined';

export default function useNotifications() {
  const [notify, setNotify] = useState(() => loadFlag('notify') && supported && Notification.permission === 'granted');
  const [sound, setSound] = useState(() => loadFlag('sound', true));
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');
  const audioRef = useRef(null);
  const notifyRef = useRef(notify);
  const soundRef = useRef(sound);
  notifyRef.current = notify;
  soundRef.current = sound;

  // Must be called from a click: asks for browser permission the first time.
  const setNotifyEnabled = useCallback(async (on) => {
    if (!on) { setNotify(false); saveFlag('notify', false); return; }
    if (!supported) return;
    const result = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    setPermission(result);
    const granted = result === 'granted';
    setNotify(granted);
    saveFlag('notify', granted);
  }, []);

  const setSoundEnabled = useCallback((on) => { setSound(on); saveFlag('sound', on); }, []);

  // Browsers only allow audio after a user gesture, so create the context lazily.
  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current && window.AudioContext) audioRef.current = new AudioContext();
      audioRef.current?.resume?.();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, []);

  const beep = useCallback(() => {
    const ctx = audioRef.current;
    if (!soundRef.current || !ctx || ctx.state !== 'running') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  }, []);

  // Shows a system notification only when the page is not visible.
  const show = useCallback(async ({ title, body, tag }) => {
    if (!notifyRef.current || !supported || Notification.permission !== 'granted' || !document.hidden) return;
    const opts = { body, tag, icon: '/icon-192.png', badge: '/icon-192.png' };
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) await reg.showNotification(title, opts);
      else new Notification(title, opts);
    } catch { /* ignore */ }
  }, []);

  return { notify, sound, permission, supported, setNotifyEnabled, setSoundEnabled, beep, show };
}
