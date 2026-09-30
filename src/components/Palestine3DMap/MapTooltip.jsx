export function MapTooltip({ x, y, title, rows }) {
  return (
    <div
      className="parp-map__tooltip"
      style={{ transform: `translate(${x + 14}px, ${y + 14}px)` }}
      role="tooltip"
    >
      <div className="parp-map__tooltip-title">{title}</div>
      {rows.map((r, i) => (
        <div key={i} className="parp-map__tooltip-row">
          <span>{r.label}</span><span>{r.value}</span>
        </div>
      ))}
    </div>
  )
}