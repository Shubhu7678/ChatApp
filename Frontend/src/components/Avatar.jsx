import { initials } from '../lib';

export default function Avatar({ name, color, emoji, size = 40 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none"
      style={{ width: size, height: size, background: color, fontSize: size * (emoji ? 0.5 : 0.36) }}
      aria-hidden="true"
    >
      {emoji || initials(name || '?')}
    </span>
  );
}
