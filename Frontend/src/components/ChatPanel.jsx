import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import EmojiPicker from './EmojiPicker';
import MessageMenu from './MessageMenu';
import { formatDistance, formatTime } from '../lib';

const TYPING_EMIT_MS = 2000;

function typingText(names) {
  if (names.length === 0) return '';
  if (names.length === 1) return `${names[0]} is typing…`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
  return 'Several people are typing…';
}

export default function ChatPanel({
  threadKey, me, peer, nearbyPeer, messages, connected, radius, blocked, typing, reactions,
  onSend, onBack, onTyping, onReact, onBlock, onReport,
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuFor, setMenuFor] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const lastTyping = useRef(0);
  const isPublic = threadKey === 'public';
  const outOfRange = !isPublic && !nearbyPeer;
  const disabled = !connected || outOfRange;
  const visibleMsgs = messages.filter((m) => !(m.from.id in blocked));
  const typers = Object.entries(typing[threadKey] || {}).filter(([uid]) => uid !== me.id).map(([, n]) => n);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [visibleMsgs.length, threadKey]);
  useEffect(() => {
    setText(''); setError(''); setPickerOpen(false); setMenuFor(null); lastTyping.current = 0;
  }, [threadKey]);

  const stopTyping = () => {
    if (lastTyping.current) { onTyping(threadKey, false); lastTyping.current = 0; }
  };

  const change = (value) => {
    setText(value);
    if (!value.trim()) return stopTyping();
    const now = Date.now();
    if (now - lastTyping.current > TYPING_EMIT_MS) { lastTyping.current = now; onTyping(threadKey, true); }
  };

  const submit = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    setText('');
    stopTyping();
    const res = await onSend(threadKey, t);
    setError(res.ok ? '' : res.error || 'Could not send');
  };

  const addEmoji = (emoji) => {
    change(text + emoji);
    setPickerOpen(false);
    inputRef.current?.focus();
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
            <div><h2 className="font-bold leading-tight">Everyone nearby</h2><p className="text-xs text-mute">Visible to people within {formatDistance(radius)} of you</p></div>
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
        {visibleMsgs.length === 0 && (
          <p className="mx-auto mt-16 max-w-xs text-center text-sm leading-relaxed text-mute">
            {isPublic ? 'Nobody has said anything yet. Say hi to your neighbourhood.' : `Say hi to ${peer?.name}. This chat disappears when either of you leaves.`}
          </p>
        )}
        <ul className="mx-auto flex max-w-2xl flex-col gap-1.5">
          {visibleMsgs.map((m, i) => {
            const mine = m.from.id === me.id;
            const first = i === 0 || visibleMsgs[i - 1].from.id !== m.from.id;
            const rx = Object.entries(reactions[m.id] || {});
            const mineRx = rx.filter(([, ids]) => ids.includes(me.id)).map(([e]) => e);
            return (
              <li key={m.id} className={`rise flex flex-col ${mine ? 'items-end' : 'items-start'} ${first ? 'mt-2' : ''}`}>
                {first && isPublic && !mine && (
                  <span className="mb-1 ml-1 text-xs font-semibold" style={{ color: m.from.color }}>{m.from.name}</span>
                )}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Message options"
                  onClick={() => setMenuFor((id) => (id === m.id ? null : m.id))}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setMenuFor((id) => (id === m.id ? null : m.id))}
                  className={`max-w-[80%] cursor-pointer whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px] leading-snug outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${mine ? 'rounded-br-md bg-accent text-accent-ink' : 'rounded-bl-md border border-line bg-surface'}`}
                >
                  {m.text}
                  <span className={`ml-2 inline-block translate-y-0.5 text-[10px] ${mine ? 'text-accent-ink/70' : 'text-mute'}`}>{formatTime(m.ts)}</span>
                </div>
                {rx.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {rx.map(([emoji, ids]) => (
                      <button
                        key={emoji}
                        onClick={() => onReact(m.id, threadKey, emoji)}
                        aria-pressed={ids.includes(me.id)}
                        className={`rounded-full border px-2 py-0.5 text-xs ${ids.includes(me.id) ? 'border-accent bg-accent/15' : 'border-line bg-surface'}`}
                      >
                        {emoji} <span className="font-semibold">{ids.length}</span>
                      </button>
                    ))}
                  </div>
                )}
                {menuFor === m.id && (
                  <MessageMenu
                    mine={mine}
                    myReactions={mineRx}
                    onReact={(e) => onReact(m.id, threadKey, e)}
                    onReport={() => onReport(m.from, m.text)}
                    onBlock={() => onBlock(m.from)}
                    onClose={() => setMenuFor(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-line bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-5">
        <div className="mx-auto max-w-2xl">
          <p className="mb-1 h-4 text-xs text-mute" aria-live="polite">{typingText(typers)}</p>
          {(error || outOfRange) && (
            <p className="mb-2 text-xs text-red-600 dark:text-red-400">
              {outOfRange ? `${peer?.name} is out of range or offline.` : error}
            </p>
          )}
          <div className="relative flex items-center gap-2">
            {pickerOpen && <EmojiPicker onPick={addEmoji} onClose={() => setPickerOpen(false)} />}
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              disabled={disabled}
              aria-label="Open emoji picker"
              aria-expanded={pickerOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl hover:bg-sunk disabled:opacity-40"
            >
              😊
            </button>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => change(e.target.value)}
              onBlur={stopTyping}
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
        </div>
      </form>
    </section>
  );
}
