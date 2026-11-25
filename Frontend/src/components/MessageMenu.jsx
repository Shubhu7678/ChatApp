import { useState } from 'react';
import { REACTIONS } from '../lib';

export default function MessageMenu({ mine, myReactions, onReact, onReport, onBlock, onClose }) {
  const [reported, setReported] = useState(false);

  return (
    <div className="rise mt-1.5 flex flex-wrap items-center gap-1 rounded-2xl border border-line bg-surface p-1 shadow-sm">
      {REACTIONS.map((e) => (
        <button
          key={e}
          onClick={() => { onReact(e); onClose(); }}
          aria-label={`React ${e}`}
          aria-pressed={myReactions.includes(e)}
          className={`rounded-lg px-1.5 py-1 text-lg hover:bg-sunk ${myReactions.includes(e) ? 'bg-sunk' : ''}`}
        >
          {e}
        </button>
      ))}
      {!mine && (
        <>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <button
            disabled={reported}
            onClick={async () => { await onReport(); setReported(true); }}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-mute hover:bg-sunk disabled:opacity-60"
          >
            {reported ? 'Reported' : 'Report'}
          </button>
          <button
            onClick={() => { if (window.confirm('Block this person? You will no longer see each other.')) { onBlock(); onClose(); } }}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-sunk dark:text-red-400"
          >
            Block
          </button>
        </>
      )}
    </div>
  );
}
