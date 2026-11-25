import { initials } from '../lib';

export default function Avatar({ name, color, size = 40 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials(name || '?')}
    </span>
  );
}
