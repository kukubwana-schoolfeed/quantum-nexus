/**
 * StatCard — Reusable metric card for dashboard panels.
 * Displays a label, value, optional sublabel, and trend indicator.
 * @module Shared
 * @phase 2
 */

/** Props for the StatCard component. */
interface StatCardProps {
  /** Card label (e.g. "Revenue Today") */
  label: string;
  /** Primary value to display (e.g. "K2,500") */
  value: string | number;
  /** Optional sublabel below the value */
  sublabel?: string;
  /** Optional trend direction */
  trend?: 'up' | 'down' | 'stable';
  /** Optional trend percentage (e.g. "+12%") */
  trendValue?: string;
  /** Optional icon character */
  icon?: string;
}

/**
 * StatCard component for displaying a single metric.
 * @param {StatCardProps} props - Component props
 * @returns {JSX.Element} Statistic card
 */
export default function StatCard({
  label,
  value,
  sublabel,
  trend,
  trendValue,
  icon,
}: StatCardProps): JSX.Element {
  const trendColor =
    trend === 'up'
      ? 'text-green-400'
      : trend === 'down'
        ? 'text-red-400'
        : 'text-gray-400';

  const trendArrow =
    trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        {icon && <span className="text-gray-500 text-base">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && trendValue && (
          <span className={`text-xs font-medium ${trendColor}`}>
            {trendArrow} {trendValue}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-gray-500">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
