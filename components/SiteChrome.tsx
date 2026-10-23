import { TRUTH } from '@/content/truth'
import { withBase } from '@/lib/path'
import { buildDate } from '@/lib/site'
import { ThemeToggle, IstClock } from './Preferences'
export function Header() {
  const initial = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <header className="site-header">
      <a href={withBase('/')} className="brand">
        {TRUTH.identity.name}
      </a>
      <nav aria-label="Main navigation" className="site-nav">
        <a href={withBase('/#work')}>Work</a>
        <a href={withBase('/writing/')}>Writing</a>
        <a href={withBase('/lab/')}>Lab</a>
        <a href={withBase('/about/')}>About</a>
        <a href={withBase('/#elsewhere')}>Elsewhere</a>
      </nav>
      <div className="header-tools">
        <IstClock initial={initial} />
        <ThemeToggle />
      </div>
    </header>
  )
}
export function Footer() {
  const { links } = TRUTH.identity
  const profiles = [
    ['GitHub', links.github],
    ['Hugging Face', links.huggingface],
    ['Kaggle', links.kaggle],
    ['X', links.x],
    ['LinkedIn', links.linkedin],
    ['spacedrift', links.studio],
    ['PhilArchive', links.preprint],
    ['Reddit', links.reddit],
    ['Instagram', links.instagram],
  ]
  return (
    <footer className="site-footer mono muted">
      <div className="footer-links">
        {profiles.map(([label, url]) => (
          <a key={label} href={url} rel="me noreferrer" target="_blank">
            {label} ↗
          </a>
        ))}
        <a href={withBase('/now/')}>Now</a>
      </div>
      <div className="footer-bottom">
        <span>Last updated {buildDate}</span>
        <span>Static site · no tracking · built with Next.js</span>
        <span>
          © {new Date(buildDate).getUTCFullYear()} {TRUTH.identity.name}
        </span>
      </div>
    </footer>
  )
}
