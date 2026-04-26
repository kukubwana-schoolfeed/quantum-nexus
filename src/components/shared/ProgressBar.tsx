/**
 * ProgressBar — Reusable progress bar for completeness scores and metrics.
 * @module Shared
 * @phase 2
 */

/** Props for the ProgressBar component. */
interface ProgressBarProps {
  /** Current value (0-100) */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Bar colour class override */
  colorClass?: string;
  /** Label displayed beside the bar */
  label?: string;
  /** Whether to show the percentage text */
  showPercent?: boolean;
  /** Secondary label below the bar */
  sublabel?: string;
}

/**
 * ProgressBar component for visualising metric completeness.
 * @param {ProgressBarProps} props - Component props
 * @returns {JSX.Element} Progress bar with label
 */
export default function ProgressBar({
  value,
  max = 100,
  colorClass,
  label,
  showPercent = true,
  sublabel,
}: ProgressBarProps): JSX.Element {
  const percent = Math.min(Math.round((value / max) * 100), 100);
  const barColor =
    colorClass ??
    (percent >= 70
      ? 'bg-green-500'
      : percent >= 40
        ? 'bg-yellow-500'
        : 'bg-red-500');

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showPercent && (
            <span className="text-xs text-gray-400">{percent}%</span>
          )}
        </div>
      )}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {sublabel && <span className="text-xs text-gray-500 mt-1">{sublabel}</span>}
    </div>
  );
}
