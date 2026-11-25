import { angleFor, formatDistance, initials } from '../lib';

const C = 150; // centre of the 300x300 viewBox
const R = 128; // outer ring radius

export default function RadarView({ me, nearby, radius, onOpen }) {
  return (
    <div className="p-3">
      <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-sm" role="group" aria-label="Radar of people nearby">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <circle cx={C} cy={C} r={R * f} className="fill-none stroke-line" strokeWidth="1" strokeDasharray={f === 1 ? '0' : '3 4'} />
            <text x={C} y={C - R * f - 3} textAnchor="middle" className="fill-mute" fontSize="8">
              {formatDistance(Math.round((radius * f) / 10) * 10)}
            </text>
          </g>
        ))}
        <circle cx={C} cy={C} r="7" className="fill-accent" />
        <circle cx={C} cy={C} r="7" className="ping-ring fill-accent/40" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />

        {nearby.map((u) => {
          const dist = Math.min(1, u.distance / radius) * R;
          const a = angleFor(u.id);
          const x = C + Math.cos(a) * dist;
          const y = C + Math.sin(a) * dist;
          return (
            <g
              key={u.id}
              role="button"
              tabIndex={0}
              aria-label={`${u.name}, ${formatDistance(u.distance)} away. Open chat`}
              onClick={() => onOpen(u.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(u.id)}
              className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-ink"
            >
              <circle cx={x} cy={y} r="15" fill={u.color} stroke="white" strokeWidth="2" />
              <text x={x} y={y + 3.5} textAnchor="middle" fill="white" fontSize={u.emoji ? 13 : 10} fontWeight="700" pointerEvents="none">
                {u.emoji || initials(u.name)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mx-auto mt-2 max-w-xs text-center text-xs leading-relaxed text-mute">
        {nearby.length === 0 ? 'No one in range yet.' : 'Distance is accurate. Direction is not shown, to protect everyone’s privacy.'}
      </p>
      <span className="sr-only">{me.name} is at the centre</span>
    </div>
  );
}
