import { useState } from 'react';
import Radar from './Radar';

export default function Onboarding({ onDone }) {
  const [name, setName] = useState('');
  const ok = name.trim().length >= 2;

  return (
    <main className="flex min-h-full items-center justify-center p-5">
      <form
        onSubmit={(e) => { e.preventDefault(); if (ok) onDone(name.trim().slice(0, 20)); }}
        className="rise w-full max-w-sm"
      >
        <div className="mb-8 flex items-center gap-3">
          <Radar size={44} />
          <h1 className="text-3xl font-extrabold tracking-tight">Nearby</h1>
        </div>
        <h2 className="text-xl font-bold leading-snug">Talk to people within 1&nbsp;km of you.</h2>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          No account, no history. Pick a nickname and you're in. Messages are never stored,
          and others only ever see a rough distance, never your location.
        </p>

        <label htmlFor="nick" className="mt-8 block text-sm font-semibold">Nickname</label>
        <input
          id="nick"
          autoFocus
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rohan"
          className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          disabled={!ok}
          className="mt-4 w-full rounded-xl bg-accent px-4 py-3 font-semibold text-accent-ink transition enabled:hover:opacity-90 disabled:opacity-40"
        >
          Continue
        </button>
        <p className="mt-4 text-xs text-mute">Your browser will ask for location access next.</p>
      </form>
    </main>
  );
}
