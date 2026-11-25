import { useState } from 'react';
import Avatar from './Avatar';
import Radar from './Radar';
import RadarView from './RadarView';
import { formatDistance } from '../lib';

const Badge = ({ n }) =>
  n ? <span className="ml-auto min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-xs font-bold text-accent-ink">{n}</span> : null;

function Row({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${active ? 'bg-sunk' : 'hover:bg-sunk/60'}`}
    >
      {children}
    </button>
  );
}

export default function Sidebar({ me, nearby, connected, active, unread, onOpen, radius, limits, onRadius, blocked, onUnblock, onProfile }) {
  const [tab, setTab] = useState('list');
  const blockedList = Object.entries(blocked);

  return (
    <aside className="flex h-full flex-col border-line bg-surface md:border-r">
      <header className="flex items-center gap-3 border-b border-line px-4 py-4">
        <Radar />
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold leading-none tracking-tight">Nearby</h1>
          <p className="mt-1 text-xs text-mute">
            {connected ? `${nearby.length} ${nearby.length === 1 ? 'person' : 'people'} within ${formatDistance(radius)}` : 'Connecting…'}
          </p>
        </div>
        <button
          onClick={onProfile}
          aria-label="Edit your profile"
          className="ml-auto flex items-center gap-2 rounded-full py-1 pl-3 pr-1 hover:bg-sunk"
        >
          <span className="hidden text-sm font-semibold sm:inline md:hidden lg:inline">{me.name}</span>
          <Avatar name={me.name} color={me.color} emoji={me.emoji} size={32} />
        </button>
      </header>

      <div className="border-b border-line px-4 py-3">
        <label htmlFor="radius" className="flex items-baseline justify-between text-xs font-semibold">
          <span>Chat range</span>
          <span className="text-accent">{formatDistance(radius)}</span>
        </label>
        <input
          id="radius"
          type="range"
          min={limits.min}
          max={limits.max}
          step={100}
          value={radius}
          onChange={(e) => onRadius(Number(e.target.value))}
          className="mt-2 w-full accent-[rgb(var(--accent))]"
        />
        <p className="mt-1 text-[11px] leading-snug text-mute">You and someone else see each other only inside the smaller of your two ranges.</p>
      </div>

      <div role="tablist" className="mx-3 mt-3 flex rounded-xl bg-sunk p-1 text-sm font-semibold">
        {['list', 'radar'].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 capitalize transition ${tab === t ? 'bg-surface shadow-sm' : 'text-mute'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <Row active={active === 'public'} onClick={() => onOpen('public')}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg text-accent-ink" aria-hidden="true">#</span>
          <span className="min-w-0">
            <span className="block font-semibold">Everyone nearby</span>
            <span className="block truncate text-xs text-mute">Public chat for your area</span>
          </span>
          <Badge n={unread.public} />
        </Row>

        {tab === 'radar' ? (
          <RadarView me={me} nearby={nearby} radius={radius} onOpen={onOpen} />
        ) : (
          <>
            <h2 className="px-3 pb-1 pt-5 text-xs font-bold uppercase tracking-wider text-mute">People</h2>
            {nearby.length === 0 && (
              <p className="px-3 py-4 text-sm leading-relaxed text-mute">
                No one else is around yet. Try a bigger range, or share the link with someone nearby.
              </p>
            )}
            {nearby.map((u) => (
              <Row key={u.id} active={active === u.id} onClick={() => onOpen(u.id)}>
                <Avatar name={u.name} color={u.color} emoji={u.emoji} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-mute">{formatDistance(u.distance)}{u.status ? ` · ${u.status}` : ' away'}</span>
                </span>
                <Badge n={unread[u.id]} />
              </Row>
            ))}
          </>
        )}

        {blockedList.length > 0 && (
          <details className="mt-4 px-3 pb-3">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-mute">Blocked ({blockedList.length})</summary>
            <ul className="mt-2 space-y-1">
              {blockedList.map(([id, name]) => (
                <li key={id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{name}</span>
                  <button onClick={() => onUnblock(id)} className="text-xs font-semibold text-accent hover:underline">Unblock</button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </aside>
  );
}
