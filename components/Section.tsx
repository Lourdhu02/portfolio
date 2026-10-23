export function Section({
  id,
  label,
  aside,
  children,
}: {
  id?: string
  label: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  const [index, ...parts] = label.split(' — ')
  return (
    <section id={id} className="section">
      <div className="section-header">
        <div className="section-heading">
          <span className="section-index mono">{index}</span>
          <h2 className="section-label">{parts.join(' — ') || label}</h2>
        </div>
        {aside ? <div className="mono muted">{aside}</div> : null}
      </div>
      {children}
    </section>
  )
}
