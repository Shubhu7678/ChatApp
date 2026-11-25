import Radar from './Radar';

const COPY = {
  asking: ['Finding you…', 'Allow location access in the browser prompt so we can find people within 1 km.'],
  denied: ['Location is blocked', 'Nearby needs your location to work. Enable it for this site in your browser settings, then try again.'],
  unavailable: ['Can’t get your location', 'Your device couldn’t determine a position. Check that location services are on and try again.'],
};

export default function LocationGate({ status, onRetry }) {
  const [title, body] = COPY[status] || COPY.unavailable;
  return (
    <main className="flex min-h-full items-center justify-center p-5">
      <div className="rise max-w-sm text-center">
        <div className="mb-6 flex justify-center"><Radar size={56} /></div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-mute">{body}</p>
        {status !== 'asking' && (
          <button onClick={onRetry} className="mt-6 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-ink hover:opacity-90">
            Try again
          </button>
        )}
      </div>
    </main>
  );
}
