import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 1. Block training/scraping crawlers that don't drive direct search value
      {
        userAgent: [
          'GPTBot',
          'Google-Extended',
          'CCBot',
          'Bytespider',
        ],
        disallow: '/',
      },

      // 2. Allow traffic-driving conversational AI search assistants
      {
        userAgent: [
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
        ],
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // 3. General rules for Google Search, standard search engines, and normal users
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],

    sitemap: 'https://biodata99.com/sitemap.xml',
    host: 'https://biodata99.com',
  }
}