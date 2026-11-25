export default function Radar({ size = 28 }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <span className="ping-ring absolute inset-0 rounded-full bg-accent/40" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-accent" />
    </span>
  );
}
