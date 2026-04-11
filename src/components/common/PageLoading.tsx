interface PageLoadingProps {
  message?: string;
}

export function PageLoading({
  message = '页面正在加载，请稍候…',
}: PageLoadingProps) {
  return (
    <div className="page-stack">
      <div className="panel loading-panel" role="status" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
}
