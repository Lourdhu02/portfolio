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
  return (
    <section id={id} className="section">
      <div className="section-header">
        <h2 className="section-label">{label}</h2>
        {aside ? <div className="mono muted">{aside}</div> : null}
      </div>
      {children}
    </section>
  )
}
