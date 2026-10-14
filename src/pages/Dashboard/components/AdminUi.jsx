import { formatCount } from "../../../features/admin/dashboardModel.js";
export function AdminIcon({ name, ...props }) {
  const shapes = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5" />
      </>
    ),
    news: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h3M14 15h2M8 18h8" />
      </>
    ),
    reviews: (
      <>
        <path d="M9 3H5v18h14V3h-4" />
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="m8 13 3 3 5-6" />
      </>
    ),
    payments: (
      <>
        <rect x="2" y="5" width="20" height="15" rx="3" />
        <path d="M2 10h20M6 15h4" />
      </>
    ),
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    refresh: <path d="M20 7a9 9 0 1 0 1 8M20 2v6h-6" />,
    exit: <path d="M9 3H3v18h6M10 12h11m-4-4 4 4-4 4" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    school: <path d="m2 9 10-6 10 6M5 10v11h14V10M10 21v-6h4v6M8 11h1m6 0h1" />,
  };
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {shapes[name] || shapes.overview}
    </svg>
  );
}
export function AdminPanel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`ac-panel ${className}`}>
      <div className="ac-panel-head">
        <div>
          {eyebrow && <small>{eyebrow}</small>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function AdminEmpty({ children }) {
  return <p className="ac-empty">{children}</p>;
}
export function AdminError({ error, retry, ar }) {
  return error ? (
    <div className="ac-alert ac-alert--error" role="alert">
      <span>{error}</span>
      {retry && (
        <button type="button" onClick={retry}>
          {ar ? "إعادة المحاولة" : "Retry"}
        </button>
      )}
    </div>
  ) : null;
}
export function AdminLoading({ ar }) {
  return (
    <div className="ac-loading" role="status">
      <span />
      {ar ? "جارٍ تحميل البيانات…" : "Loading data…"}
    </div>
  );
}
export function AdminMetric({ label, value, icon, ar, index }) {
  return (
    <article className="ac-metric">
      <div className="ac-metric-top">
        <span>{label}</span>
        <AdminIcon name={icon} />
      </div>
      <strong>{value == null ? "—" : formatCount(value, ar)}</strong>
      <span className="ac-metric-bottom">
        <span>PARP</span>
        <small>{String(index + 1).padStart(2, "0")}</small>
      </span>
    </article>
  );
}
