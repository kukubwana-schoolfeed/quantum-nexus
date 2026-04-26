/**
 * StatusBadge — Reusable status indicator badge.
 * Colour-codes status strings for visual scanning.
 * @module Shared
 * @phase 2
 */

/** Props for the StatusBadge component. */
interface StatusBadgeProps {
  /** Status string to display and colour-code */
  status: string;
}

/**
 * Maps known statuses to Tailwind colour classes.
 * Unknown statuses default to gray.
 */
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  live: 'bg-green-500/20 text-green-400',
  published: 'bg-green-500/20 text-green-400',
  complete: 'bg-green-500/20 text-green-400',
  pass: 'bg-green-500/20 text-green-400',
  resolved: 'bg-green-500/20 text-green-400',
  approved: 'bg-green-500/20 text-green-400',
  green: 'bg-green-500/20 text-green-400',

  pending: 'bg-yellow-500/20 text-yellow-400',
  pending_approval: 'bg-yellow-500/20 text-yellow-400',
  pending_safety: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  draft: 'bg-yellow-500/20 text-yellow-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  submitted: 'bg-blue-500/20 text-blue-400',
  candidate: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-blue-500/20 text-blue-400',
  publishing: 'bg-blue-500/20 text-blue-400',

  NEW: 'bg-purple-500/20 text-purple-400',
  ACTIVE: 'bg-green-500/20 text-green-400',
  AGING: 'bg-yellow-500/20 text-yellow-400',
  EXPIRED: 'bg-gray-500/20 text-gray-400',

  failed: 'bg-red-500/20 text-red-400',
  held: 'bg-red-500/20 text-red-400',
  rejected: 'bg-red-500/20 text-red-400',
  suspended: 'bg-red-500/20 text-red-400',
  red: 'bg-red-500/20 text-red-400',

  unpaid: 'bg-red-500/20 text-red-400',
  overdue: 'bg-red-500/20 text-red-400',
  grace_period: 'bg-orange-500/20 text-orange-400',
  archived: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
  sent: 'bg-green-500/20 text-green-400',
  amber: 'bg-orange-500/20 text-orange-400',
  improving: 'bg-green-500/20 text-green-400',
  stable: 'bg-blue-500/20 text-blue-400',
  declining: 'bg-red-500/20 text-red-400',
  transcribed: 'bg-green-500/20 text-green-400',
  uploading: 'bg-blue-500/20 text-blue-400',
};

/**
 * StatusBadge component for rendering colour-coded status labels.
 * @param {StatusBadgeProps} props - Component props
 * @returns {JSX.Element} Colour-coded status badge
 */
export default function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-500/20 text-gray-400';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
