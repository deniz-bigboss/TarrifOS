/**
 * Kustaro brand mark: an abstract K built from a checkpoint post and two
 * route strokes passing through it — a port-gate/checkpoint motif (no ships,
 * no globes). Inherits size via className; colors are fixed brand teals so it
 * reads identically on light and dark surfaces.
 */
export function KustaroMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      {/* gate post */}
      <rect x="6" y="4" width="5" height="24" rx="1.5" fill="#2dd4bf" />
      {/* inbound route */}
      <path
        d="M25 5.5 14 15.2a1.6 1.6 0 0 0 0 1.6L25 26.5"
        stroke="#0e7490"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* checkpoint node */}
      <circle cx="13.5" cy="16" r="2.6" fill="#2dd4bf" />
    </svg>
  );
}

/** Wordmark lockup used in headers/footers. */
export function KustaroLogo({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <KustaroMark className="h-6 w-6" />
      <span className={`text-lg font-semibold tracking-tight ${textClassName ?? ""}`}>
        Kustaro
      </span>
    </span>
  );
}
