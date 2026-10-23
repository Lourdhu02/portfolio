/** Small, deterministic diagrams: each visual describes the actual project. */
export function ProjectVisual({
  kind,
}: {
  kind: 'meter' | 'achilles' | 'svtr' | 'echome' | 'finance' | 'paper'
}) {
  if (kind === 'meter')
    return (
      <div className="project-visual meter-visual" aria-hidden="true">
        <div className="visual-topline mono">
          <span>Field image → structured reading</span>
          <span>OCR / serving</span>
        </div>
        <div className="meter-crop">
          <i className="crop-corner tl" />
          <i className="crop-corner tr" />
          <i className="crop-corner bl" />
          <i className="crop-corner br" />
          <div className="meter-digits">04827.1</div>
          <span className="meter-unit mono">kWh · synthetic specimen</span>
        </div>
        <div className="pipeline-labels mono">
          <span>Detect</span>
          <i />
          <span>Recognize</span>
          <i />
          <span>Verify</span>
          <i />
          <span>Read</span>
        </div>
        <div className="scan-line" />
      </div>
    )
  if (kind === 'achilles')
    return (
      <div className="project-visual achilles-visual" aria-hidden="true">
        <div className="visual-topline mono">
          <span>Build from first principles</span>
          <span>↗</span>
        </div>
        <div className="achilles-matrix">
          {[
            '∂',
            'W',
            'Σ',
            'BPE',
            'QKᵀ',
            '▧',
            'KV',
            'L',
            'DDP',
            'ΔW',
            'DPO',
            'GRPO',
            'INT8',
            '→',
            'EVAL',
            '◇',
            'RAG',
            'MoE',
          ].map((label, i) => (
            <span className={`matrix-cell matrix-${i % 4}`} key={label}>
              {label}
            </span>
          ))}
        </div>
        <div className="visual-bottomline mono">A working model starts with the fundamentals.</div>
      </div>
    )
  if (kind === 'svtr')
    return (
      <div className="project-visual routing-visual" aria-hidden="true">
        <svg viewBox="0 0 400 220" fill="none">
          <path
            d="M45 110H110M110 110V45H180M110 110H180M110 110V175H180M245 45H290V110H350M245 110H350M245 175H290V110"
            stroke="currentColor"
            strokeWidth="1"
          />
          <rect
            x="20"
            y="88"
            width="52"
            height="44"
            fill="var(--color-paper)"
            stroke="currentColor"
          />
          <rect
            x="180"
            y="23"
            width="65"
            height="44"
            fill="var(--color-paper)"
            stroke="currentColor"
          />
          <rect
            x="180"
            y="88"
            width="65"
            height="44"
            fill="var(--color-paper)"
            stroke="currentColor"
          />
          <rect
            x="180"
            y="153"
            width="65"
            height="44"
            fill="var(--color-paper)"
            stroke="currentColor"
          />
          <circle cx="350" cy="110" r="21" fill="var(--color-ink)" />
          <text x="46" y="115">
            in
          </text>
          <text x="212" y="50">
            short
          </text>
          <text x="212" y="115">
            mid
          </text>
          <text x="212" y="180">
            long
          </text>
          <text x="350" y="115" fill="var(--color-paper)">
            ctc
          </text>
        </svg>
        <span className="visual-caption mono">Adaptive routing. Same inference graph.</span>
      </div>
    )
  if (kind === 'echome')
    return (
      <div className="project-visual memory-visual" aria-hidden="true">
        <svg viewBox="0 0 400 220" fill="none">
          <circle cx="200" cy="110" r="88" stroke="currentColor" strokeDasharray="2 7" />
          <circle cx="200" cy="110" r="53" stroke="currentColor" opacity=".25" />
          <path d="M200 110L112 110M200 110L244 34M200 110L244 186" stroke="currentColor" />
          <rect x="179" y="89" width="42" height="42" fill="var(--color-ink)" />
          <circle cx="112" cy="110" r="7" fill="var(--color-ink)" />
          <circle cx="244" cy="34" r="7" fill="var(--color-ink)" />
          <circle cx="244" cy="186" r="7" fill="var(--color-ink)" />
          <text x="63" y="92">
            episodic
          </text>
          <text x="289" y="38">
            semantic
          </text>
          <text x="294" y="192">
            procedural
          </text>
        </svg>
        <span className="visual-caption mono">Memory that carries across sessions.</span>
      </div>
    )
  if (kind === 'finance')
    return (
      <div className="project-visual finance-visual" aria-hidden="true">
        <div className="document doc-back">
          <span className="mono">Statement</span>
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="document doc-front">
          <span className="mono">Invoice</span>
          <div className="doc-mark">F.</div>
          <i />
          <i />
          <i />
          <div className="document-footer mono">Local by design ↗</div>
        </div>
      </div>
    )
  return (
    <div className="paper-visual" aria-hidden="true">
      <svg viewBox="0 0 180 180" fill="none">
        <rect x="28" y="28" width="95" height="95" stroke="currentColor" />
        <rect x="57" y="57" width="95" height="95" stroke="currentColor" />
        <path d="M28 28L152 152M123 28L57 152" stroke="currentColor" opacity=".25" />
      </svg>
    </div>
  )
}
