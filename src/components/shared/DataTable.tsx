/**
 * DataTable — Reusable data table component for listing records.
 * Renders column headers and rows from structured data.
 * @module Shared
 * @phase 2
 */

/** Column definition for the DataTable. */
interface Column {
  /** Column header label */
  header: string;
  /** Key in the data object to render */
  key: string;
  /** Optional render function for custom cell content */
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

/** Props for the DataTable component. */
interface DataTableProps {
  /** Column definitions */
  columns: Column[];
  /** Row data — array of objects */
  data: Record<string, unknown>[];
  /** Optional empty state message */
  emptyMessage?: string;
}

/**
 * DataTable component for rendering tabular data.
 * @param {DataTableProps} props - Component props
 * @returns {JSX.Element} Data table with headers and rows
 */
export default function DataTable({
  columns,
  data,
  emptyMessage = 'No data available',
}: DataTableProps): JSX.Element {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={String(row.id ?? rowIdx)}
              className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="py-2 px-3 text-gray-300">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
