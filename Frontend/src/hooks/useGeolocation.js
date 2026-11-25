import { useEffect, useState } from 'react';

// status: 'asking' | 'ok' | 'denied' | 'unavailable'
export default function useGeolocation(enabled) {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('asking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) { setStatus('unavailable'); return; }
    setStatus('asking');
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setStatus('ok');
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled, attempt]);

  return { coords, status, retry: () => setAttempt((n) => n + 1) };
}
