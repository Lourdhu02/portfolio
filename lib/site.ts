import { TRUTH } from '@/content/truth'
import { withBase } from './path'
export const buildDate = new Date().toISOString().slice(0, 10)
export const siteAddress = (path = '/') => `${TRUTH.identity.siteUrl}${withBase(path)}`
export const displayDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
export const readingTime = (content: string) =>
  Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 200))
