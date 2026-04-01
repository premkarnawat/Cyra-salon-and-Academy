export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-[var(--gold-pale)] border-t-[var(--gold)] animate-spin"
      />
    </div>
  );
}
