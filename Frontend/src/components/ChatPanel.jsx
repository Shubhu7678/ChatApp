import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import { formatDistance, formatTime } from '../lib';

export default function ChatPanel({ threadKey, me, peer, nearbyPeer, messages, connected, onSend, onBack }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const isPublic = threadKey === 'public';
  const outOfRange = !isPublic && !nearbyPeer;
  const disabled = !connected || outOfRange;

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length, threadKey]);
  useEffect(() => { setText(''); setError(''); }, [threadKey]);

  const submit = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    setText('');
    const res = await onSend(threadKey, t);
    setError(res.ok ? '' : res.error || 'Could not send');
  };

  return (
    <section className="flex h-full min-w-0 flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-3 md:px-5">
        <button onClick={onBack} className="rounded-lg p-2 text-mute hover:bg-sunk md:hidden" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        {isPublic ? (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg text-accent-ink" aria-hidden="true">#</span>
            <div><h2 className="font-bold leading-tight">Everyone nearby</h2><p className="text-xs text-mute">Visible to people within 1 km of you</p></div>
          </>
        ) : (
          <>
            <Avatar name={peer?.name} color={peer?.color} />
            <div>
              <h2 className="font-bold leading-tight">{peer?.name}</h2>
              <p className="text-xs text-mute">{nearbyPeer ? `${formatDistance(nearbyPeer.distance)} away` : 'Out of range'}</p>
            </div>
          </>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
        {messages.length === 0 && (
          <p className="mx-auto mt-16 max-w-xs text-center text-sm leading-relaxed text-mute">
            {isPublic ? 'Nobody has said anything yet. Say hi to your neighbourhood.' : `Say hi to ${peer?.name}. This chat disappears when either of you leaves.`}
          </p>
        )}
        <ul className="mx-auto flex max-w-2xl flex-col gap-1.5">
          {messages.map((m, i) => {
            const mine = m.from.id === me.id;
            const first = i === 0 || messages[i - 1].from.id !== m.from.id;
            return (
              <li key={m.id} className={`rise flex flex-col ${mine ? 'items-end' : 'items-start'} ${first ? 'mt-2' : ''}`}>
                {first && isPublic && !mine && (
                  <span className="mb-1 ml-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color: m.from.color }}>
                    {m.from.name}
                  </span>
                )}
                <div className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${mine ? 'rounded-br-md bg-accent text-accent-ink' : 'rounded-bl-md border border-line bg-surface'}`}>
                  {m.text}
                  <span className={`ml-2 inline-block translate-y-0.5 text-[10px] ${mine ? 'text-accent-ink/70' : 'text-mute'}`}>{formatTime(m.ts)}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-line bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-5">
        {(error || outOfRange) && (
          <p className="mx-auto mb-2 max-w-2xl text-xs text-red-600 dark:text-red-400">
            {outOfRange ? `${peer?.name} is out of range or offline.` : error}
          </p>
        )}
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            disabled={disabled}
            placeholder={connected ? 'Write a message' : 'Reconnecting…'}
            className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
          />
          <button
            disabled={disabled || !text.trim()}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition enabled:hover:opacity-90 disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </button>
        </div>
      </form>
    </section>
  );
}
