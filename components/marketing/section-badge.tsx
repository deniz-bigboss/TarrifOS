/** Small blue section label used at the top of every marketing band. */
export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
      {children}
    </span>
  );
}
