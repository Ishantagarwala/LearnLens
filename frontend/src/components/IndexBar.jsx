// Visual bar for a single index score.
// `value` is on a 0–100 scale unless `raw` is provided (for Diagnostic on 0–4).

function fillColor(value) {
  if (value < 40) return "#dc2626";
  if (value < 60) return "#f59e0b";
  if (value < 80) return "#0f766e";
  return "#1e3a8a";
}

export default function IndexBar({ label, sublabel, value, raw }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="index-row">
      <div className="label">
        {label}
        {sublabel ? <small>{sublabel}</small> : null}
      </div>
      <div className="bar" aria-hidden="true">
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, background: fillColor(pct) }}
        />
      </div>
      <div className="value">
        {raw != null ? raw : pct}
        <small>{raw != null ? " / 4" : " / 100"}</small>
      </div>
    </div>
  );
}
