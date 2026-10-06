// The four pets, drawn as flat geometric characters in a 200×200 box with the ground at y≈186.
// Colours come from the theme: bodies in --color-text, eyes and inner details in --color-bg,
// secondary parts in --color-muted and one red detail each in --color-accent. Animation hooks
// are class names (.pet-*) styled in globals.css; the pupils follow the pointer through
// --look-x / --look-y set on the card (components/pets/PetPen.tsx).

export type PetKind = 'cat' | 'dog' | 'hamster' | 'parrot'

function Eye({ cx, cy, r, pupil, slit = false }: { cx: number; cy: number; r: number; pupil: number; slit?: boolean }) {
  return (
    <g className="pet-eye">
      <circle cx={cx} cy={cy} r={r} className="fill-bg" />
      {slit
        ? <ellipse cx={cx} cy={cy} rx={pupil * 0.45} ry={pupil * 1.7} className="pet-pupil fill-text" />
        : <circle cx={cx} cy={cy} r={pupil} className="pet-pupil fill-text" />}
    </g>
  )
}

// Jinx: a black-cat silhouette with slit pupils and a red collar. Watches the meter.
function Cat() {
  return (
    <>
      <path className="pet-tail pet-tail--sway fill-none stroke-text" strokeWidth="12" strokeLinecap="round"
        d="M132 170 C168 170 176 140 164 118 C157 105 166 94 176 99" style={{ transformOrigin: '132px 170px' }} />
      <g className="pet-breathe">
        <ellipse cx="100" cy="150" rx="42" ry="37" className="fill-text" />
        <ellipse cx="83" cy="183" rx="13" ry="6" className="fill-text" />
        <ellipse cx="117" cy="183" rx="13" ry="6" className="fill-text" />
        <g className="pet-head">
          <path d="M64 74 L69 34 L96 58 Z" className="pet-ear pet-ear--l fill-text" style={{ transformOrigin: '80px 62px' }} />
          <path d="M136 74 L131 34 L104 58 Z" className="pet-ear pet-ear--r fill-text" style={{ transformOrigin: '120px 62px' }} />
          <path d="M71 64 L73 46 L85 57 Z" className="fill-bg opacity-40" />
          <path d="M129 64 L127 46 L115 57 Z" className="fill-bg opacity-40" />
          <circle cx="100" cy="90" r="40" className="fill-text" />
          <Eye cx={84} cy={88} r={9} pupil={4} slit />
          <Eye cx={116} cy={88} r={9} pupil={4} slit />
          <path d="M95 101 L105 101 L100 107 Z" className="fill-accent" />
          <path d="M100 107 Q96 113 91 110 M100 107 Q104 113 109 110" className="fill-none stroke-bg" strokeWidth="2" strokeLinecap="round" />
          <path d="M66 100 L44 96 M66 106 L45 108 M134 100 L156 96 M134 106 L155 108" className="stroke-text" strokeWidth="2" strokeLinecap="round" />
        </g>
        <path d="M70 124 Q100 140 130 124" className="fill-none stroke-accent" strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="136" r="5" className="fill-accent" />
      </g>
    </>
  )
}

// Tobi: a floppy-eared retriever carrying a document. Fetches the right page.
function Dog() {
  return (
    <>
      <path className="pet-tail pet-tail--wag fill-none stroke-text" strokeWidth="11" strokeLinecap="round"
        d="M138 152 C158 144 166 124 160 108" style={{ transformOrigin: '138px 152px' }} />
      <g className="pet-breathe">
        <rect x="58" y="122" width="84" height="60" rx="30" className="fill-text" />
        <ellipse cx="80" cy="183" rx="13" ry="6" className="fill-text" />
        <ellipse cx="120" cy="183" rx="13" ry="6" className="fill-text" />
        <path d="M74 126 Q100 138 126 126" className="fill-none stroke-accent" strokeWidth="6" strokeLinecap="round" />
        <g className="pet-head">
          {/* CSS animation would replace a transform attribute, so the tilt and the flop sit on separate elements */}
          <g className="pet-ear pet-ear--l" style={{ transformOrigin: '66px 66px' }}>
            <ellipse cx="62" cy="88" rx="13" ry="26" transform="rotate(18 62 88)" className="fill-muted" />
          </g>
          <g className="pet-ear pet-ear--r" style={{ transformOrigin: '134px 66px' }}>
            <ellipse cx="138" cy="88" rx="13" ry="26" transform="rotate(-18 138 88)" className="fill-muted" />
          </g>
          <circle cx="100" cy="86" r="38" className="fill-text" />
          <ellipse cx="100" cy="104" rx="21" ry="15" className="fill-muted opacity-50" />
          <Eye cx={86} cy={80} r={7} pupil={4} />
          <Eye cx={114} cy={80} r={7} pupil={4} />
          <ellipse cx="100" cy="96" rx="7" ry="5" className="fill-accent" />
          <path d="M100 101 L100 106" className="stroke-bg" strokeWidth="2" strokeLinecap="round" />
          {/* The fetched document */}
          <g className="pet-prop">
            <rect x="85" y="106" width="30" height="20" rx="2" className="fill-bg stroke-text" strokeWidth="2" />
            <path d="M90 112 H110 M90 117 H106 M90 121 H102" className="stroke-muted" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </>
  )
}

// Mikey: a round hamster stuffing seeds into his cheeks, one bin at a time.
function Hamster() {
  return (
    <>
      <g className="pet-breathe">
        <circle cx="74" cy="100" r="12" className="pet-ear pet-ear--l fill-muted" style={{ transformOrigin: '74px 108px' }} />
        <circle cx="126" cy="100" r="12" className="pet-ear pet-ear--r fill-muted" style={{ transformOrigin: '126px 108px' }} />
        <ellipse cx="100" cy="142" rx="54" ry="46" className="fill-text" />
        <ellipse cx="78" cy="184" rx="12" ry="5" className="fill-text" />
        <ellipse cx="122" cy="184" rx="12" ry="5" className="fill-text" />
        <g className="pet-head">
          <Eye cx={84} cy={124} r={6.5} pupil={3.5} />
          <Eye cx={116} cy={124} r={6.5} pupil={3.5} />
          <ellipse cx="70" cy="142" rx="14" ry="11" className="pet-cheek fill-accent opacity-30" style={{ transformOrigin: '70px 142px' }} />
          <ellipse cx="130" cy="142" rx="14" ry="11" className="pet-cheek fill-accent opacity-30" style={{ transformOrigin: '130px 142px' }} />
          <path d="M96 134 L104 134 L100 139 Z" className="fill-accent" />
          <path d="M100 139 Q97 144 93 142 M100 139 Q103 144 107 142" className="fill-none stroke-bg" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g className="pet-prop" style={{ transformOrigin: '100px 160px' }}>
          <ellipse cx="100" cy="161" rx="7" ry="9" className="fill-muted" />
          <circle cx="90" cy="163" r="5" className="fill-text stroke-bg" strokeWidth="1.5" />
          <circle cx="110" cy="163" r="5" className="fill-text stroke-bg" strokeWidth="1.5" />
        </g>
      </g>
    </>
  )
}

// Luffy: a parrot on a perch who repeats what you say, in your voice.
function Parrot() {
  return (
    <>
      <path d="M48 178 H152" className="stroke-muted" strokeWidth="6" strokeLinecap="round" />
      <path d="M93 176 L84 197 M101 176 L98 198" className="pet-tail pet-tail--sway stroke-text" strokeWidth="7" strokeLinecap="round" style={{ transformOrigin: '97px 176px' }} />
      <g className="pet-breathe">
        <path d="M100 66 C136 66 146 118 132 156 C124 178 78 180 70 158 C56 120 64 66 100 66 Z" className="fill-text" />
        <path d="M74 112 C66 134 72 158 92 166 C90 146 88 126 74 112 Z" className="pet-wing fill-muted" style={{ transformOrigin: '76px 114px' }} />
        <path d="M88 178 L88 172 M112 178 L112 172" className="stroke-accent" strokeWidth="5" strokeLinecap="round" />
        <g className="pet-head">
          <path d="M96 68 C90 56 94 46 104 42 M104 68 C102 56 108 48 118 46" className="pet-crest fill-none stroke-text" strokeWidth="6" strokeLinecap="round" style={{ transformOrigin: '100px 68px' }} />
          <Eye cx={108} cy={90} r={9} pupil={4.5} />
          <path d="M116 96 C134 94 140 110 128 122 C126 112 120 108 112 108 Z" className="fill-accent" />
          {/* Sound waves: Luffy talks back */}
          <g className="pet-voice fill-none stroke-accent" strokeWidth="3" strokeLinecap="round">
            <path d="M146 100 Q152 108 146 116" />
            <path d="M156 94 Q166 108 156 122" />
          </g>
        </g>
      </g>
    </>
  )
}

const ART: Record<PetKind, () => React.JSX.Element> = { cat: Cat, dog: Dog, hamster: Hamster, parrot: Parrot }

export function PetArt({ kind, className = '' }: { kind: PetKind; className?: string }) {
  const Art = ART[kind]
  return (
    <svg viewBox="0 0 200 200" className={`pet pet--${kind} overflow-visible ${className}`} aria-hidden="true">
      <ellipse cx="100" cy="190" rx="58" ry="6" className="pet-shadow fill-text opacity-10" />
      <g className="pet-figure">
        <Art />
      </g>
    </svg>
  )
}
