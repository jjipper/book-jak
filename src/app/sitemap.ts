import type { MetadataRoute } from 'next'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { SITE_URL } from './site-url'

const STATIC_PATHS = [
  '/', '/home', '/test', '/discover', '/rate',
  '/social', '/social/clubs', '/social/people',
  '/about', '/notice', '/contact', '/terms', '/privacy',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: 'weekly' as const })),
    ...Object.keys(READING_TYPES).map((code) => ({
      url: `${SITE_URL}/result/${code}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
