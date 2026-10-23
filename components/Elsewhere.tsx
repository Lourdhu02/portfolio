import { TRUTH, PREPRINT_PAGES, SOCIAL_SOURCES } from '@/content/truth'
import { getStats } from '@/lib/stats'
import { SourceLink } from './ui/Receipt'
import { Reveal, CardMotion } from './MotionSystem'
export async function Elsewhere() {
  const stats = await getStats()
  const { links } = TRUTH.identity
  const profiles = [
    {
      name: 'GitHub',
      handle: '@Lourdhu02',
      description: 'Code for everything here, Achilles and OCR tooling',
      stat: `${stats.repos} repos · ${stats.followers} followers`,
      href: links.github,
      source: SOCIAL_SOURCES.github,
      fallback: stats.githubFallback,
    },
    {
      name: 'Hugging Face',
      handle: 'lourdhu02',
      description: 'Models, datasets and Spaces I publish',
      stat: `${stats.models} models`,
      href: links.huggingface,
      source: SOCIAL_SOURCES.huggingface,
      fallback: stats.huggingfaceFallback,
    },
    {
      name: 'Kaggle',
      handle: 'blourdhuraju',
      description: 'Notebooks on CV and tabular ML',
      stat: 'Notebooks Expert',
      href: links.kaggle,
    },
    {
      name: 'X',
      handle: '@_lourdhu',
      description: "Short notes on inference, OCR and what I'm building",
      stat: 'Follow',
      href: links.x,
    },
    {
      name: 'LinkedIn',
      handle: '/in/lourdhu',
      description: 'Work history and longer updates',
      stat: 'Connect',
      href: links.linkedin,
    },
    {
      name: 'spacedrift',
      handle: 'spacedrift.in',
      description: 'My ML studio: document AI and research ops',
      stat: `${TRUTH.studio.team} people · ${TRUTH.studio.clients} clients`,
      href: links.studio,
      source: TRUTH.studio.source,
    },
    {
      name: 'PhilArchive',
      handle: 'No Final Save',
      description: 'Preprint on identity in persistent AI agents',
      stat: `${PREPRINT_PAGES.value} pp`,
      href: links.preprint,
      source: PREPRINT_PAGES.source,
    },
    {
      name: 'Reddit',
      handle: 'u/lourdhu_',
      description: 'Where I ask and answer ML questions',
      stat: 'Profile',
      href: links.reddit,
    },
    {
      name: 'Instagram',
      handle: '@lourdu_02',
      description: 'Life outside the terminal',
      stat: 'Profile',
      href: links.instagram,
    },
  ]
  return (
    <ul className="index-list social-grid">
      {profiles.map((p, i) => (
        <li key={p.name}>
          <Reveal delay={(i % 3) * 0.04}>
            <CardMotion className="social-card">
              <a
                href={p.href}
                target="_blank"
                rel="me noreferrer"
                className="card-cover"
                aria-label={`Visit ${p.name}`}
              />
              <div className="social-card-top">
                <h3 className="social-name">{p.name}</h3>
                <span aria-hidden="true">↗</span>
              </div>
              <span className="mono muted social-handle">{p.handle}</span>
              <p className="social-description muted">{p.description}</p>
              <div className="social-card-bottom">
                <span className="mono social-stat">{p.stat}</span>
                {p.source ? (
                  <div className="receipt">
                    <SourceLink source={p.source} />
                    {p.fallback ? ' · last verified snapshot' : null}
                  </div>
                ) : null}
              </div>
            </CardMotion>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
