interface ApiErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function ApiError({ message, onRetry }: ApiErrorProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-red-900/50 p-6 text-center">
      <p className="text-red-400 font-medium">{message ?? 'Failed to load data'}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
