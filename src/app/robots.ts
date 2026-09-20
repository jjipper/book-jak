import type { MetadataRoute } from 'next'
import { SITE_URL } from './site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/my', '/notifications', '/design-system'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
