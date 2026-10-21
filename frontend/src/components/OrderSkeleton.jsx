export default function OrderSkeleton({ count = 6 }) {
  return Array.from({ length: count }, (_, index) => (
    <div className="skeleton-card" style={{ '--i': index }} key={index} aria-hidden="true">
      <div className="skeleton-row">
        <span className="skeleton skeleton-pill" />
        <span className="skeleton skeleton-pill skeleton-pill-short" />
      </div>
      <span className="skeleton skeleton-line skeleton-track" />
      <span className="skeleton skeleton-line skeleton-title" />
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line skeleton-line-short" />
      <div className="skeleton-row skeleton-foot">
        <span className="skeleton skeleton-line skeleton-date" />
        <span className="skeleton skeleton-pill" />
      </div>
    </div>
  ))
}
