import Avatar from './Avatar';
import Radar from './Radar';
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

export default function Sidebar({ me, nearby, connected, active, unread, onOpen }) {
  return (
    <aside className="flex h-full flex-col border-line bg-surface md:border-r">
      <header className="flex items-center gap-3 border-b border-line px-4 py-4">
        <Radar />
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold leading-none tracking-tight">Nearby</h1>
          <p className="mt-1 text-xs text-mute">
            {connected ? `${nearby.length} ${nearby.length === 1 ? 'person' : 'people'} within 1 km` : 'Connecting…'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm font-semibold sm:inline md:hidden lg:inline">{me.name}</span>
          <Avatar name={me.name} color={me.color} size={32} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-2">
        <Row active={active === 'public'} onClick={() => onOpen('public')}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg text-accent-ink" aria-hidden="true">#</span>
          <span className="min-w-0">
            <span className="block font-semibold">Everyone nearby</span>
            <span className="block truncate text-xs text-mute">Public chat for your 1 km area</span>
          </span>
          <Badge n={unread.public} />
        </Row>

        <h2 className="px-3 pb-1 pt-5 text-xs font-bold uppercase tracking-wider text-mute">People</h2>
        {nearby.length === 0 && (
          <p className="px-3 py-4 text-sm leading-relaxed text-mute">
            No one else is around yet. Share the link with someone nearby to try it out.
          </p>
        )}
        {nearby.map((u) => (
          <Row key={u.id} active={active === u.id} onClick={() => onOpen(u.id)}>
            <Avatar name={u.name} color={u.color} />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{u.name}</span>
              <span className="block text-xs text-mute">{formatDistance(u.distance)} away</span>
            </span>
            <Badge n={unread[u.id]} />
          </Row>
        ))}
      </div>
    </aside>
  );
}
