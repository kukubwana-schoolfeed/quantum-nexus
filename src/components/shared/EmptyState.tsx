/**
 * EmptyState — Reusable empty state placeholder for sections with no data.
 * @module Shared
 * @phase 2
 */

/** Props for the EmptyState component. */
interface EmptyStateProps {
  /** Title for the empty state */
  title: string;
  /** Description explaining why it's empty or what to do */
  description?: string;
}

/**
 * EmptyState component displayed when a section has no data.
 * @param {EmptyStateProps} props - Component props
 * @returns {JSX.Element} Empty state panel
 */
export default function EmptyState({
  title,
  description,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 border-dashed p-8 text-center">
      <p className="text-gray-400 font-medium">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}
