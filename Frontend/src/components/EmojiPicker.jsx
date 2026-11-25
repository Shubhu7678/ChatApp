const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎', '🤔', '😅',
  '😢', '😭', '😡', '😴', '🥳', '🤯', '😮', '😬', '🙄', '😇',
  '👍', '👎', '👏', '🙌', '🙏', '💪', '👋', '🤝', '🫡', '🤞',
  '❤️', '🔥', '✨', '🎉', '💯', '👀', '☕', '🍕', '🍔', '🎶',
  '🌧️', '☀️', '🚗', '🚌', '📍', '🏃', '🐶', '🐱', '🎮', '📚',
];

export default function EmojiPicker({ onPick, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-label="Emoji picker" className="rise absolute bottom-full left-0 z-20 mb-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-line bg-surface p-2 shadow-lg">
        <div className="grid grid-cols-10 gap-0.5">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => onPick(e)} className="rounded-md p-1 text-lg hover:bg-sunk" aria-label={`Insert ${e}`}>{e}</button>
          ))}
        </div>
      </div>
    </>
  );
}
