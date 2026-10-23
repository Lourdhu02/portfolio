import type { MetadataRoute } from 'next'
import { posts } from '#velite'
import { siteAddress } from '@/lib/site'
export const dynamic = 'force-static'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/about/',
    '/now/',
    '/writing/',
    '/work/meter-ocr/',
    '/work/svtrv2-ard/',
    '/work/echome/',
    '/work/finsentinel/',
    ...posts.filter((p) => !p.draft).map((p) => `/writing/${p.slug}/`),
  ].map((path) => ({ url: siteAddress(path) }))
}
