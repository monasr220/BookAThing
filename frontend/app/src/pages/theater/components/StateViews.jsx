export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="state-box">
      <i className="fa-solid fa-spinner fa-spin"></i>
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box state-error">
      <i className="fa-solid fa-triangle-exclamation"></i>
      <span>{message}</span>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }) {
  return (
    <div className="state-box">
      <i className="fa-regular fa-folder-open"></i>
      <span>{message}</span>
    </div>
  )
}
