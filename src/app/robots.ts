import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Block AI model training crawlers
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'Google-Extended',
          'CCBot',
          'Bytespider',
        ],
        disallow: '/',
      },

      // Allow AI assistants that can drive traffic
      {
        userAgent: ['ChatGPT-User', 'PerplexityBot'],
        allow: '/',
      },

      // General rules for search engines
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