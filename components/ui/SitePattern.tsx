// Site background: a static isometric cube lattice that scrolls with the page. It is pure CSS
// (.site-pattern in globals.css) and exists so the glass panels have detail to bend.
export function SitePattern() {
  return <div aria-hidden="true" className="site-pattern pointer-events-none absolute inset-0 -z-10" />
}
