import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import { EMOJIS } from './EmojiPicker';
import { COLORS } from '../lib';

function Toggle({ label, hint, checked, onChange, disabled }) {
  return (
    <label className={`flex items-center justify-between gap-3 py-2 ${disabled ? 'opacity-50' : ''}`}>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-mute">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-[rgb(var(--accent))]"
      />
    </label>
  );
}

export default function ProfileDialog({ profile, notif, onSave, onClose }) {
  const [name, setName] = useState(profile.name);
  const [emoji, setEmoji] = useState(profile.emoji || '');
  const [status, setStatus] = useState(profile.status || '');
  const [color, setColor] = useState(profile.color);
  const [error, setError] = useState('');
  const valid = name.trim().length >= 2;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    const res = await onSave({ name: name.trim().slice(0, 20), emoji, status: status.trim().slice(0, 60), color });
    if (res?.ok === false) setError(res.error || 'Could not save');
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="rise max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center gap-3">
          <Avatar name={name || '?'} color={color} emoji={emoji} size={52} />
          <h2 id="profile-title" className="text-lg font-bold">Your profile</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto rounded-lg p-2 text-mute hover:bg-sunk">✕</button>
        </div>

        <label htmlFor="p-name" className="mt-5 block text-sm font-semibold">Nickname</label>
        <input id="p-name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" />

        <label htmlFor="p-status" className="mt-4 block text-sm font-semibold">Status <span className="font-normal text-mute">(optional)</span></label>
        <input id="p-status" value={status} maxLength={60} onChange={(e) => setStatus(e.target.value)} placeholder="e.g. Out for chai"
          className="mt-1.5 w-full rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" />

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Avatar</legend>
          <div className="mt-1.5 grid grid-cols-10 gap-0.5">
            <button type="button" onClick={() => setEmoji('')} aria-pressed={!emoji} aria-label="Use initials"
              className={`col-span-2 rounded-md px-1 text-xs font-semibold ${!emoji ? 'bg-sunk' : 'hover:bg-sunk'}`}>Aa</button>
            {EMOJIS.slice(0, 48).map((e) => (
              <button key={e} type="button" onClick={() => setEmoji(e)} aria-pressed={emoji === e} aria-label={`Use ${e}`}
                className={`rounded-md p-1 text-lg ${emoji === e ? 'bg-sunk ring-1 ring-accent' : 'hover:bg-sunk'}`}>{e}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Color</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Color ${c}`} aria-pressed={color === c}
                className={`h-8 w-8 rounded-full ${color === c ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </fieldset>

        <div className="mt-5 divide-y divide-line border-t border-line">
          <Toggle
            label="Notifications"
            hint={!notif.supported ? 'Not supported in this browser' : notif.permission === 'denied' ? 'Blocked in your browser settings' : 'When Nearby is in the background'}
            checked={notif.notify}
            disabled={!notif.supported || notif.permission === 'denied'}
            onChange={notif.setNotifyEnabled}
          />
          <Toggle label="Message sound" checked={notif.sound} onChange={notif.setSoundEnabled} />
        </div>

        {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
        <button disabled={!valid} className="mt-5 w-full rounded-xl bg-accent px-4 py-3 font-semibold text-accent-ink enabled:hover:opacity-90 disabled:opacity-40">
          Save
        </button>
      </form>
    </div>
  );
}
